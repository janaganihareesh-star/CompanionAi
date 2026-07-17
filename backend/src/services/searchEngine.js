const axios = require('axios');
const NodeCache = require('node-cache');
const searchCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 }); // Cache for 1 hour

/**
 * Enterprise-Grade Web Search using Tavily API + Cache
 * @param {string} query - The search query
 * @returns {Promise<Object>} - The search results with citations
 */
const performSearch = async (query) => {
  try {
    const cacheKey = query.toLowerCase().trim();
    const cachedResult = searchCache.get(cacheKey);
    if (cachedResult) {
      console.log(`[SEARCH CACHE HIT] Query: "${query}"`);
      return cachedResult;
    }

    const apiKey = process.env.TAVILY_API_KEY;
    
    if (!apiKey) {
      console.warn('[SEARCH] TAVILY_API_KEY is missing. Falling back to DuckDuckGo Scraper.');
      return await fallbackDuckDuckGo(query);
    }

    const response = await axios.post(
      'https://api.tavily.com/search',
      {
        api_key: apiKey,
        query: query,
        search_depth: "advanced",
        include_answer: true,
        include_images: false,
        include_raw_content: false,
        max_results: 3,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data && response.data.answer) {
      // Map Tavily results to our citation format
      const citations = response.data.results.map(result => ({
        title: result.title,
        url: result.url,
        content: result.content
      }));

      const result = {
        answer: response.data.answer,
        citations: citations
      };
      searchCache.set(cacheKey, result);
      return result;
    }

    return await fallbackDuckDuckGo(query);
  } catch (error) {
    console.warn('[SEARCH] Tavily API Failed, falling back to DuckDuckGo:', error.message);
    return await fallbackDuckDuckGo(query);
  }
};

async function fallbackDuckDuckGo(query) {
  try {
    const { search } = require('duck-duck-scrape');
    const searchResults = await search(query, { safeSearch: 'off' });
    
    if (searchResults && searchResults.results && searchResults.results.length > 0) {
      const topResults = searchResults.results.slice(0, 3);
      
      const citations = topResults.map(r => ({
        title: r.title,
        url: r.url,
        content: r.description
      }));
      
      const combinedDescription = topResults.map(r => r.description).join(' ');
      
      const result = {
        answer: combinedDescription || "I found some links that might help.",
        citations: citations
      };
      searchCache.set(query.toLowerCase().trim(), result);
      return result;
    }
    
    return { answer: "I couldn't find a direct answer to that right now even with fallback.", citations: [] };
  } catch (err) {
    console.error('[SEARCH] DuckDuckGo fallback also failed:', err.message);
    return { answer: "I'm having trouble connecting to the web right now.", citations: [] };
  }
}

module.exports = {
  performSearch
};
