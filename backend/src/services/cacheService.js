const NodeCache = require('node-cache');

// Standard TTL is 5 minutes (300 seconds)
const cache = new NodeCache({ stdTTL: 300, checkperiod: 120, useClones: false });

const cacheService = {
  get: (key) => {
    return cache.get(key);
  },
  
  set: (key, value, ttl = 300) => {
    return cache.set(key, value, ttl);
  },
  
  del: (key) => {
    return cache.del(key);
  },
  
  flush: () => {
    return cache.flushAll();
  },

  // Helper to get or set if not exists
  getOrSet: async (key, fetchFunction, ttl = 300) => {
    const cachedData = cache.get(key);
    if (cachedData !== undefined) {
      return cachedData;
    }
    const data = await fetchFunction();
    cache.set(key, data, ttl);
    return data;
  }
};

module.exports = cacheService;
