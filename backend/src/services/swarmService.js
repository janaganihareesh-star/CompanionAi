const socketConfig = require('../config/socket');
const aiService = require('./aiService');
const osAgent = require('./osAgent');
const codeExecutionService = require('./codeExecutionService');
const Message = require('../models/Message');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper for retries
const withRetry = async (fn, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries - 1) throw err;
      await delay(1000 * (i + 1));
    }
  }
};

exports.handleSwarm = async (conversationId, userId, goal, aiName, userName) => {
  console.log(`[Swarm] Initiating swarm for user ${userId} with goal: ${goal}`);
  
  socketConfig.emitToUser(userId, 'agent:start', { agent: 'Orchestrator', message: 'Analyzing project scope and initializing parallel agents...' });
  await delay(1000);
  
  try {
    // 1. PARALLEL EXECUTION: Architect (Design) + Researcher (Context/Docs)
    socketConfig.emitToUser(userId, 'agent:start', { agent: 'Architect', message: 'Designing architecture...' });
    socketConfig.emitToUser(userId, 'agent:start', { agent: 'Researcher', message: 'Gathering technical context and docs...' });

    let architectResponse = '';
    let researcherResponse = '';

    await Promise.all([
      withRetry(async () => {
        await aiService.generateAIResponse({
          messages: [{ role: 'user', parts: [{ text: `You are the Architect. The user wants to: "${goal}". Provide a high-level architectural plan.` }] }],
          systemPrompt: 'You are an expert software architect.',
          onChunk: (chunk) => {
            architectResponse += chunk;
            socketConfig.emitToUser(userId, 'agent:thought', { agent: 'Architect', message: `Drafting: ${chunk.substring(0, 30)}...` });
          }
        });
        socketConfig.emitToUser(userId, 'agent:complete', { agent: 'Architect' });
      }),
      withRetry(async () => {
        await aiService.generateAIResponse({
          messages: [{ role: 'user', parts: [{ text: `You are the Researcher. Find the best technical stack and libraries for: "${goal}". Be concise.` }] }],
          systemPrompt: 'You are an expert technical researcher.',
          onChunk: (chunk) => {
            researcherResponse += chunk;
            socketConfig.emitToUser(userId, 'agent:thought', { agent: 'Researcher', message: `Researching: ${chunk.substring(0, 30)}...` });
          }
        });
        socketConfig.emitToUser(userId, 'agent:complete', { agent: 'Researcher' });
      })
    ]);

    // 2. Developer Agent with Self-Healing Loop
    socketConfig.emitToUser(userId, 'agent:start', { agent: 'Developer', message: 'Writing code based on architecture and research...' });
    
    let developerResponse = '';
    let isCodeWorking = false;
    let attempts = 0;
    const maxAttempts = 5;
    let feedback = '';

    while (!isCodeWorking && attempts < maxAttempts) {
      attempts++;
      developerResponse = '';
      const loopPrompt = feedback ? `Your previous code failed with this error: \n${feedback}\nPlease fix it and rewrite the full working code.` : `You are the Developer. Architect's plan: "${architectResponse}". Research: "${researcherResponse}". Write the full code for: "${goal}". Output ONLY valid markdown code blocks.`;
      
      await withRetry(async () => {
        await aiService.generateAIResponse({
          messages: [{ role: 'user', parts: [{ text: loopPrompt }] }],
          systemPrompt: 'You are an expert developer. Output only valid code.',
          onChunk: (chunk) => {
            developerResponse += chunk;
            socketConfig.emitToUser(userId, 'agent:thought', { agent: 'Developer', message: `Coding (Attempt ${attempts}): ${chunk.substring(0, 30)}...` });
            socketConfig.emitToUser(userId, 'agent:live_code', { chunk });
          }
        });
      });

      // Extract JS code to test
      const match = developerResponse.match(/```(?:javascript|js)?\n([\s\S]*?)```/i);
      if (match && match[1]) {
        socketConfig.emitToUser(userId, 'agent:start', { agent: 'Tester', message: 'Testing code in Sandbox...' });
        try {
          const testOutput = await codeExecutionService.executeSecurely(match[1].trim());
          if (testOutput.includes('ERROR:')) {
            throw new Error(testOutput); // Force feedback loop
          }
          isCodeWorking = true;
          socketConfig.emitToUser(userId, 'agent:thought', { agent: 'Tester', message: 'Code passed sandbox tests.' });
          socketConfig.emitToUser(userId, 'agent:complete', { agent: 'Tester' });
        } catch (sandboxErr) {
          feedback = sandboxErr.message || sandboxErr;
          
          if (attempts >= 2) {
            console.log(`[Cognitive Breaking] Endless Hallucination Detected! Triggering Emergency Doc-Scrape...`);
            socketConfig.emitToUser(userId, 'agent:thought', { agent: 'Researcher', message: 'Hallucination detected. Scraping official docs to break loop...' });
            try {
              const urlScraper = require('./urlScraperService');
              const scrapeData = await urlScraper.scrapeUrl('https://react.dev/reference/react');
              feedback += `\n\n[EMERGENCY OVERRIDE - OFFICIAL DOCS INJECTED]: \n${scrapeData.content.substring(0, 1500)}`;
            } catch(e) {}
          } else {
            socketConfig.emitToUser(userId, 'agent:thought', { agent: 'Tester', message: `Sandbox failed: ${feedback.substring(0,40)}... Retrying.` });
          }
        }
      } else {
        // No runnable JS found, assume it's just text or HTML and move on
        isCodeWorking = true;
      }
    }
    
    socketConfig.emitToUser(userId, 'agent:complete', { agent: 'Developer' });

    // 3. Reviewer Agent
    socketConfig.emitToUser(userId, 'agent:start', { agent: 'Reviewer', message: 'Testing & reviewing code...' });
    let reviewerResponse = '';
    await withRetry(async () => {
      await aiService.generateAIResponse({
        messages: [{ role: 'user', parts: [{ text: `Review this code for bugs and security issues:\n\n${developerResponse}` }] }],
        systemPrompt: 'You are a strict code reviewer.',
        onChunk: (chunk) => {
          reviewerResponse += chunk;
          socketConfig.emitToUser(userId, 'agent:thought', { agent: 'Reviewer', message: `Reviewing: ${chunk.substring(0, 30)}...` });
        }
      });
    });
    socketConfig.emitToUser(userId, 'agent:complete', { agent: 'Reviewer' });

    // Orchestrator Complete
    socketConfig.emitToUser(userId, 'agent:complete', { agent: 'Orchestrator' });
    
    const finalContent = `### 🚀 Swarm Implementation Complete\n\n**Architect's Plan:**\n${architectResponse}\n\n**Developer's Code:**\n${developerResponse}\n\n**Reviewer's Notes:**\n${reviewerResponse}`;
    
    const aiMessage = await Message.create({
      conversationId,
      userId,
      sender: 'ai',
      content: finalContent,
      mood: 'focused',
      confidenceScore: 99
    });

    socketConfig.emitToUser(userId, 'ai_response', { aiMessage, conversationId });
    
    if (goal.toLowerCase().includes('local')) {
      const match = developerResponse.match(/```(\w+)?\n([\s\S]*?)```/);
      if (match && match[2]) {
        const codeToSave = match[2].trim();
        const ext = match[1] === 'html' ? 'html' : match[1] === 'javascript' ? 'js' : match[1] === 'python' ? 'py' : 'txt';
        const desktopPath = await codeExecutionService.saveToDesktopSecurely(codeToSave, ext);
        console.log(`[Swarm] OS God-Mode: File written securely to ${desktopPath}`);
      }
    }

  } catch (error) {
    console.error('[Swarm Error]', error);
    socketConfig.emitToUser(userId, 'agent:thought', { agent: 'Orchestrator', message: 'Swarm encountered a critical error but tried to recover.' });
  }
};
