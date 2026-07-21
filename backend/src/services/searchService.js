const { search } = require('duck-duck-scrape');
const axios = require('axios');
const cheerio = require('cheerio');

function getCredibilityScore(url) {
  try {
    const domain = new URL(url).hostname;
    if (domain.endsWith('.gov') || domain.endsWith('.edu') || domain.includes('arxiv.org') || domain.includes('pubmed')) return 'High (Official/Academic)';
    if (domain.includes('reuters.com') || domain.includes('apnews.com') || domain.includes('bbc.com') || domain.includes('bloomberg.com')) return 'High (Reputable News)';
    if (domain.includes('reddit.com') || domain.includes('twitter.com') || domain.includes('quora.com')) return 'Medium/Low (Community Driven)';
    return 'Medium (General Web)';
  } catch (e) {
    return 'Unknown';
  }
}

/**
 * Searches the web using Tavily API if available, otherwise falls back to duck-duck-scrape.
 */
async function fetchLiveSearchResults(query, limit = 7) {
  let searchContext = '🌐 DEEP CRAWL SEARCH RESULTS:\n';

  // 1. Check if we should do a Reddit API Hack (Keep this active for community opinions)
  if (query.toLowerCase().includes('reddit') || query.toLowerCase().includes('people saying')) {
    try {
      const redditUrl = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&limit=5`;
      const redRes = await axios.get(redditUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Companion AI/13.0' }});
      
      if (redRes.data && redRes.data.data && redRes.data.data.children) {
        const posts = redRes.data.data.children;
        searchContext += `\n[REDDIT LIVE THREADS]:\n`;
        posts.forEach((post, i) => {
          const p = post.data;
          searchContext += `[R${i+1}] Title: ${p.title}\nSubreddit: r/${p.subreddit}\nUpvotes: ${p.ups}\nText: ${p.selftext ? p.selftext.substring(0, 300) : 'No text'}\n\n`;
        });
      }
    } catch (e) {
      console.error('Reddit API Hack failed:', e.message);
    }
  }

  // 2. Tavily AI Search Integration
  const tavilyKey = process.env.TAVILY_API_KEY;
  if (tavilyKey && tavilyKey !== 'your_tavily_api_key_here') {
    try {
      console.log(`[Deep Research] Triggering Tavily Search for: ${query}`);
      const response = await axios.post('https://api.tavily.com/search', {
        api_key: tavilyKey,
        query: query,
        search_depth: 'advanced',
        include_answer: true,
        max_results: limit
      });

      if (response.data && response.data.results) {
        if (response.data.answer) {
          searchContext += `\n[TAVILY AI SUMMARY]:\n${response.data.answer}\n\n`;
        }
        
        response.data.results.forEach((res, i) => {
          const credibility = getCredibilityScore(res.url);
          searchContext += `[${i + 1}] Title: ${res.title}\nSource: ${res.url}\nCredibility Score: ${credibility}\nExcerpt: ${res.content}\n\n`;
        });
        
        return searchContext;
      }
    } catch (err) {
      console.error('[Deep Research] Tavily Search failed. Falling back to DuckDuckGo.', err.message);
    }
  }

  // 3. Fallback to DuckDuckGo Scrape
  try {
    const results = await search(query, {
      safeSearch: 'moderate'
    });

    if (!results.results || results.results.length === 0) {
      return searchContext.length > 50 ? searchContext : null;
    }

    const topResults = results.results.slice(0, limit);
    
    // Concurrently fetch website contents
    const crawlPromises = topResults.map(async (res, i) => {
      const citationId = `[${i + 1}]`;
      let deepContent = res.description; // fallback

      try {
        const pageRes = await axios.get(res.url, { 
          timeout: 4000,
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
        });
        const $ = cheerio.load(pageRes.data);
        const paragraphs = $('p').map((_, el) => $(el).text()).get();
        // Extract a larger chunk of meaningful text (up to 800 chars)
        const combinedText = paragraphs.join(' ').replace(/\s+/g, ' ').trim();
        if (combinedText.length > 50) {
          deepContent = combinedText.substring(0, 800) + '...';
        }
      } catch (e) {
        console.error(`Deep crawl failed for ${res.url}:`, e.message);
      }

      const credibility = getCredibilityScore(res.url);

      return `${citationId} Title: ${res.title}\nSource: ${res.url}\nCredibility Score: ${credibility}\nExcerpt: ${deepContent}\n\n`;
    });

    const detailedResults = await Promise.all(crawlPromises);
    searchContext += detailedResults.join('');

    return searchContext;
  } catch (error) {
    console.error('DuckDuckGo Live Search failed:', error.message);
    return null;
  }
}

module.exports = {
  fetchLiveSearchResults
};
