const puppeteer = require('puppeteer');
const { generateAIResponse } = require('./aiService'); // We will assume a non-circular import, or we can use it dynamically
const codeController = require('../controllers/codeController');
const { getIO } = require('../config/socket');

exports.startAutonomousTask = async (taskDescription, userId) => {
  const io = getIO();
  const emitLog = (status, details = '') => {
    if (io && userId) {
      io.to(`user_${userId}`).emit('agent_status', { agent: 'Devin Autonomous VM', status, details });
    }
    console.log(`[Autonomous VM] ${status}`);
  };

  emitLog('Initializing Autonomous Browser...', taskDescription);

  let browser;
  try {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    emitLog('Extracting Context from Web...', 'Searching for relevant documentation or data.');
    // Simulated search based on task. If task has a URL, we navigate there.
    const urlMatch = taskDescription.match(/https?:\/\/[^\s]+/);
    let scrapedText = '';
    if (urlMatch) {
      await page.goto(urlMatch[0], { waitUntil: 'networkidle2' });
      scrapedText = await page.evaluate(() => document.body.innerText.substring(0, 5000));
      emitLog('Successfully scraped website content', `Extracted ${scrapedText.length} characters.`);
    }

    let attempt = 0;
    const MAX_RETRIES = 5;
    let lastError = null;

    while (attempt < MAX_RETRIES) {
      attempt++;
      emitLog(`Coding Loop: Attempt ${attempt}/${MAX_RETRIES}`, 'Generating script...');
      
      const aiService = require('./aiService'); // Lazy load to avoid circular dependency
      
      const prompt = `You are an Autonomous AI (like Devin). 
Task: ${taskDescription}
${scrapedText ? 'Website Content: ' + scrapedText : ''}
${lastError ? 'PREVIOUS ERROR TO FIX:\n' + lastError : ''}

Write ONLY valid Javascript code that executes the task and calls console.log with the final result. Do not include markdown codeblocks. Just raw code.`;

      const aiResponse = await aiService.generateAIResponse({
        systemPrompt: "You are an autonomous self-healing coder. Output ONLY raw javascript code.",
        messages: [{ role: 'user', parts: [{ text: prompt }] }],
        energyLevel: 'high'
      });

      let rawCode = aiResponse.text.replace(/```javascript/gi, '').replace(/```js/gi, '').replace(/```/g, '').trim();
      
      emitLog(`Executing generated code...`, rawCode.substring(0, 100) + '...');

      try {
        const execResult = await codeController.executeCodeInternally('javascript', rawCode);
        
        if (execResult.error || execResult.stderr) {
          throw new Error(execResult.stderr || execResult.error.message);
        }
        
        const finalOutput = execResult.stdout.trim();
        emitLog('Execution SUCCESS! ✅', finalOutput);
        
        if (browser) await browser.close();
        return { success: true, code: rawCode, output: finalOutput };

      } catch (err) {
        lastError = err.message || err.toString();
        emitLog(`Execution FAILED ❌. Self-healing...`, lastError);
      }
    }

    emitLog('Autonomous Task Failed', 'Exceeded maximum retries.');
    await browser.close();
    return { success: false, error: 'Max retries exceeded' };
    
  } catch (error) {
    emitLog('CRITICAL FAILURE', error.message);
    if (browser) await browser.close();
    return { success: false, error: error.message };
  }
};
