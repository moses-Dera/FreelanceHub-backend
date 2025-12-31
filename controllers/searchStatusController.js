import { searchService } from '../services/searchService.js';

// GET /search/status - Check Meilisearch status
const getSearchStatus = async (req, res) => {
    try {
        const status = {
            meilisearch: false,
            activeEngine: 'none'
        };

        // Test Meilisearch
        try {
            await searchService.searchJobs('test', { limit: 1 });
            status.meilisearch = true;
            status.activeEngine = 'meilisearch';
        } catch (error) {
            console.log('Meilisearch not available:', error.message);
        }

        res.status(200).json({
            status,
            message: status.meilisearch ? 'Meilisearch is working ✅' : 'Meilisearch not available ❌',
            setup: status.meilisearch ? null : {
                install: 'curl -L https://install.meilisearch.com | sh',
                run: './meilisearch --master-key=masterKey'
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export { getSearchStatus };