const puppeteer = require('puppeteer');

let persistentBrowser = null;
let activePages = new Map(); // Store pages for interactive sessions

async function getBrowser() {
  if (!persistentBrowser) {
    console.log(`[BrowserAgent] Booting persistent headless browser pool...`);
    persistentBrowser = await puppeteer.launch({
      headless: true, // In production, might want 'new' or false for debugging
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }
  return persistentBrowser;
}

/**
 * Puppeteer Browser Vision Agent (Pooled)
 */
exports.browseAndScreenshot = async (url) => {
  let page = null;
  try {
    const browser = await getBrowser();
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
    
    const screenshotBase64 = await page.screenshot({ encoding: 'base64', fullPage: false });
    const extractedText = await page.evaluate(() => document.body.innerText);

    return { success: true, imageBase64: `data:image/png;base64,${screenshotBase64}`, text: extractedText.substring(0, 5000) };
  } catch (error) {
    return { success: false, error: error.message };
  } finally {
    if (page) await page.close();
  }
};

/**
 * Autonomous Browser Automation (Interact with DOM)
 */
exports.executeBrowserAction = async (sessionId, action, params) => {
  try {
    const browser = await getBrowser();
    let page = activePages.get(sessionId);

    if (!page && action === 'goto') {
      page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });
      activePages.set(sessionId, page);
    }

    if (!page) throw new Error('Session not found. Call goto first.');

    switch (action) {
      case 'goto':
        await page.goto(params.url, { waitUntil: 'networkidle2' });
        break;
      case 'click':
        await page.click(params.selector);
        break;
      case 'type':
        await page.type(params.selector, params.text);
        break;
      case 'scroll':
        await page.evaluate((amount) => window.scrollBy(0, amount), params.amount || 500);
        break;
      case 'close':
        await page.close();
        activePages.delete(sessionId);
        return { success: true, message: 'Session closed' };
      default:
        throw new Error('Unknown action');
    }

    // Return the updated state
    const screenshotBase64 = await page.screenshot({ encoding: 'base64' });
    return { success: true, imageBase64: `data:image/png;base64,${screenshotBase64}` };
  } catch (error) {
    console.error('[BrowserAgent Error]:', error.message);
    return { success: false, error: error.message };
  }
};
