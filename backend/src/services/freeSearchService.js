const { search } = require('duck-duck-scrape');

exports.performFreeSearch = async (query, limit = 5) => {
  try {
    const searchResults = await search(query, {
      safeSearch: 'strict'
    });
    
    if (!searchResults.noResults) {
      // Map results to the required format
      return searchResults.results.slice(0, limit).map(result => {
        // Construct a reliable favicon URL
        let hostname = '';
        try {
          hostname = new URL(result.url).hostname;
        } catch(e) {}
        
        return {
          title: result.title,
          snippet: result.description,
          link: result.url,
          source: result.source || hostname,
          favicon: hostname ? `https://www.google.com/s2/favicons?domain=${hostname}&sz=64` : ''
        };
      });
    }
    return [];
  } catch (error) {
    console.error('Free Search Error:', error);
    return [];
  }
};
