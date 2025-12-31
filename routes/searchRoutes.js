import express from 'express';
import {
    searchJobs,
    getSearchSuggestions,
    getFilterOptions
} from '../controllers/searchController.js';
import { getSearchStatus } from '../controllers/searchStatusController.js';

const router = express.Router();

// GET /search/status - Check search engine status
router.get('/status', getSearchStatus);

// GET /search/jobs - Advanced job search with filters
router.get('/jobs', searchJobs);

// GET /search/suggestions - Get search suggestions
router.get('/suggestions', getSearchSuggestions);

// GET /search/filters - Get available filter options
router.get('/filters', getFilterOptions);

export default router;