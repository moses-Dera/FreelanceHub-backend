// Simple in-memory cache (for development)
// Use Redis in production

const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const cacheMiddleware = (duration = CACHE_TTL) => {
  return (req, res, next) => {
    const key = req.originalUrl;
    const cached = cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < duration) {
      console.log('🚀 Cache hit:', key);
      return res.json(cached.data);
    }
    
    // Override res.json to cache the response
    const originalJson = res.json;
    res.json = function(data) {
      cache.set(key, {
        data,
        timestamp: Date.now()
      });
      console.log('💾 Cached:', key);
      return originalJson.call(this, data);
    };
    
    next();
  };
};

// Clear cache helper
export const clearCache = (pattern) => {
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
};