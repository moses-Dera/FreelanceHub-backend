import { PrismaClient } from "../generated/prisma/index.js";
import { searchService } from "../services/searchService.js";

const prisma = new PrismaClient();

// GET /search/jobs - Advanced job search
const searchJobs = async (req, res) => {
    try {
        const { 
            q: query = '', 
            status = 'OPEN',
            minBudget,
            maxBudget,
            location,
            skills,
            sort = 'newest',
            page = 1,
            limit = 20
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        
        // Prepare filters
        const filters = {
            status,
            limit: parseInt(limit),
            offset,
            sort: sort === 'newest' ? ['createdAt:desc'] : 
                  sort === 'oldest' ? ['createdAt:asc'] :
                  sort === 'budget_high' ? ['budgetMax:desc'] :
                  sort === 'budget_low' ? ['budgetMin:asc'] : ['createdAt:desc']
        };

        if (minBudget) filters.minBudget = parseInt(minBudget);
        if (maxBudget) filters.maxBudget = parseInt(maxBudget);

        // Search using Meilisearch only
        const searchResults = await searchService.searchJobs(query, filters);
        
        // Get full job details from database
        const jobIds = searchResults.hits.map(hit => hit.id);
        const jobs = await prisma.jobs.findMany({
            where: {
                id: { in: jobIds }
            },
            include: {
                client: {
                    select: { id: true, fullName: true, rating: true }
                },
                _count: {
                    select: { proposal: true }
                }
            }
        });

        // Maintain search result order
        const orderedJobs = jobIds.map(id => 
            jobs.find(job => job.id === id)
        ).filter(Boolean);

        res.status(200).json({
            jobs: orderedJobs,
            totalHits: searchResults.estimatedTotalHits,
            page: parseInt(page),
            totalPages: Math.ceil(searchResults.estimatedTotalHits / parseInt(limit)),
            query,
            filters: {
                status,
                minBudget,
                maxBudget,
                location,
                skills,
                sort
            }
        });

    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: error.message });
    }
};

// GET /search/suggestions - Get search suggestions
const getSearchSuggestions = async (req, res) => {
    try {
        const { q: query } = req.query;
        
        if (!query || query.length < 2) {
            return res.status(200).json({ suggestions: [] });
        }

        const suggestions = await searchService.getSuggestions(query);
        
        res.status(200).json({ suggestions });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /search/filters - Get available filter options
const getFilterOptions = async (req, res) => {
    try {
        // Get unique values for filters
        const budgetRanges = [
            { label: 'Under $500', min: 0, max: 500 },
            { label: '$500 - $1,000', min: 500, max: 1000 },
            { label: '$1,000 - $5,000', min: 1000, max: 5000 },
            { label: '$5,000+', min: 5000, max: null }
        ];

        const sortOptions = [
            { value: 'newest', label: 'Newest First' },
            { value: 'oldest', label: 'Oldest First' },
            { value: 'budget_high', label: 'Highest Budget' },
            { value: 'budget_low', label: 'Lowest Budget' }
        ];

        const statusOptions = [
            { value: 'OPEN', label: 'Open' },
            { value: 'ASSIGNED', label: 'Assigned' },
            { value: 'COMPLETED', label: 'Completed' }
        ];

        res.status(200).json({
            budgetRanges,
            sortOptions,
            statusOptions
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export {
    searchJobs,
    getSearchSuggestions,
    getFilterOptions
};