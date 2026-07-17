const { extract } = require('duck-duck-scrape');
const cheerio = require('cheerio');
const axios = require('axios');
const browserAgent = require('./browserAgent');

exports.scrapeUrl = async (url) => {
  try {
    console.log(`[URL Scraper] Attempting to scrape: ${url}`);
    
    // Phase 1: Fast Axios/Cheerio Scrape (Saves RAM/CPU)
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 5000
    });
    
    const $ = cheerio.load(data);
    $('script, style, noscript, iframe, img, svg').remove();
    let content = $('body').text().replace(/\s+/g, ' ').trim();
    
    // If we got meaningful text, return it immediately without waking up Puppeteer!
    if (content.length > 100) {
      if (content.length > 2000) content = content.substring(0, 2000) + '... [Content Truncated]';
      return {
        title: $('title').text() || 'Unknown Page',
        content,
        success: true
      };
    }

    // Phase 2: Fallback to Puppeteer Vision (for React/SPA sites where Cheerio fails)
    console.log(`[URL Scraper] Fast scrape returned empty (SPA?). Waking up Puppeteer for ${url}...`);
    const visionResult = await browserAgent.browseAndScreenshot(url);
    if (visionResult.success && visionResult.text) {
      return {
        title: 'Puppeteer Vision Scrape',
        content: visionResult.text,
        url,
        imageBase64: visionResult.imageBase64
      };
    }
    
    const title = $('title').text() || 'Unknown Page';
    
    return {
      title,
      content,
      success: true
    };
  } catch (error) {
    console.error('URL Scraping failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};
