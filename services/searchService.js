import { MeiliSearch } from 'meilisearch';

const client = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST || 'http://127.0.0.1:7700',
  apiKey: process.env.MEILISEARCH_API_KEY || 'masterKey'
});

const JOBS_INDEX = 'jobs';

export const searchService = {
  // Initialize search index
  async initializeIndex() {
    try {
      const index = client.index(JOBS_INDEX);
      
      // Configure searchable attributes
      await index.updateSearchableAttributes([
        'title',
        'description',
        'skills',
        'location'
      ]);

      // Configure filterable attributes
      await index.updateFilterableAttributes([
        'status',
        'budgetMin',
        'budgetMax',
        'clientId',
        'createdAt'
      ]);

      // Configure sortable attributes
      await index.updateSortableAttributes([
        'createdAt',
        'budgetMin',
        'budgetMax'
      ]);

      console.log('✅ Search index initialized');
    } catch (error) {
      console.error('❌ Search index initialization failed:', error);
    }
  },

  // Add job to search index
  async addJob(job) {
    try {
      const index = client.index(JOBS_INDEX);
      await index.addDocuments([{
        id: job.id,
        title: job.title,
        description: job.description,
        budgetMin: parseInt(job.budgetMin),
        budgetMax: parseInt(job.budgetMax),
        status: job.status,
        clientId: job.clientId,
        createdAt: job.createdAt.getTime(),
        skills: job.skills || [],
        location: job.location || ''
      }]);
    } catch (error) {
      console.error('Search indexing failed:', error);
    }
  },

  // Update job in search index
  async updateJob(job) {
    await this.addJob(job); // Meilisearch handles updates automatically
  },

  // Remove job from search index
  async removeJob(jobId) {
    try {
      const index = client.index(JOBS_INDEX);
      await index.deleteDocument(jobId);
    } catch (error) {
      console.error('Search removal failed:', error);
    }
  },

  // Search jobs
  async searchJobs(query, filters = {}) {
    try {
      const index = client.index(JOBS_INDEX);
      
      const searchOptions = {
        limit: filters.limit || 20,
        offset: filters.offset || 0,
        sort: filters.sort || ['createdAt:desc']
      };

      // Add filters
      const filterArray = [];
      if (filters.status) filterArray.push(`status = "${filters.status}"`);
      if (filters.minBudget) filterArray.push(`budgetMin >= ${filters.minBudget}`);
      if (filters.maxBudget) filterArray.push(`budgetMax <= ${filters.maxBudget}`);
      if (filters.clientId) filterArray.push(`clientId = "${filters.clientId}"`);

      if (filterArray.length > 0) {
        searchOptions.filter = filterArray;
      }

      const results = await index.search(query, searchOptions);
      return results;
    } catch (error) {
      console.error('Search failed:', error);
      return { hits: [], estimatedTotalHits: 0 };
    }
  },

  // Get search suggestions
  async getSuggestions(query) {
    try {
      const index = client.index(JOBS_INDEX);
      const results = await index.search(query, {
        limit: 5,
        attributesToRetrieve: ['title']
      });
      
      return results.hits.map(hit => hit.title);
    } catch (error) {
      console.error('Suggestions failed:', error);
      return [];
    }
  }
};