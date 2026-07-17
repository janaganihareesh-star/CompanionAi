/**
 * aiService.js
 * Gemini AI response generation with Layer 5 quality checker
 * from the Master Prompt System.
 */

const axios = require('axios');
const nicheRegistry = require('./nicheRegistry');
const toolService = require('./toolService');
let getIO;
try {
  getIO = require('../config/socket').getIO;
} catch (e) {
  getIO = () => null;
}

// ─────────────────────────────────────────────────────────────────────────────
// MULTI-AGENT ORCHESTRATOR
// ─────────────────────────────────────────────────────────────────────────────
function isComplexTask(message) {
  const text = (message || '').toLowerCase();
  const complexKeywords = [
    'build a complete startup plan with financials',
    'design entire system architecture'
  ];
  const autonomousKeywords = [
    'scrape', 'autonomously', 'devin', 'search the web and write', 'self-healing'
  ];
  return {
    isComplex: complexKeywords.some(kw => text.includes(kw)),
    isAutonomous: autonomousKeywords.some(kw => text.includes(kw))
  };
}

async function runMultiAgentOrchestrator({ systemPrompt, messages, energyLevel, domain, domains, userId }) {
  console.log('[Orchestrator] Complex task detected. Spinning up Sub-Agents...');
  
  const io = getIO();
  const emitAgent = (agent, status, details = '') => {
    if (io && userId) {
      io.to(`user_${userId}`).emit('agent_status', { agent, status, details });
    }
  };

  emitAgent('Orchestrator', 'Analyzing complex request...');
  
  const originalTask = messages[messages.length - 1].parts[0].text;
  
  // Phase 1: Planner Agent
  emitAgent('Planner Agent', 'Breaking down task into execution steps...');
  const plannerPrompt = `You are the Planner Agent. Analyze the user task and break it down into specialized Sub-Agents. 
Return ONLY a valid JSON array of objects. Example: [{"agentName": "MarketAgent", "task": "Analyze market trends"}]. Do not return markdown block ticks, just raw JSON.
Task: ${originalTask}`;

  const plannerResult = await generateAIResponse({ 
    systemPrompt: "You are an expert project planner and JSON generator.", 
    messages: [{ role: 'user', parts: [{ text: plannerPrompt }] }], 
    energyLevel: 'high',
    _isOrchestratorCall: true
  });
  
  console.log('[Orchestrator] Planner output:', plannerResult.text);
  
  let agents = [];
  try {
    agents = JSON.parse(plannerResult.text.replace(/```json/g, '').replace(/```/g, '').trim());
  } catch (e) {
    console.error('Failed to parse planner JSON, fallback to basic synthesis.');
    agents = [{ agentName: 'GeneralAgent', task: originalTask }];
  }

  // Phase 2: Parallel Execution
  emitAgent('Execution Swarm', `Delegating to ${agents.length} sub-agents concurrently...`);
  
  const subAgentPromises = agents.map(agent => {
    emitAgent(agent.agentName, 'Executing assigned sub-task...');
    return generateAIResponse({
      systemPrompt: `You are the ${agent.agentName}. Your specific task is: ${agent.task}. Output a detailed report.`,
      messages: [{ role: 'user', parts: [{ text: originalTask }] }],
      energyLevel: 'high',
      _isOrchestratorCall: true
    }).then(res => `### ${agent.agentName} Report\n${res.text}`);
  });

  const reports = await Promise.all(subAgentPromises);

  // Phase 3: Synthesis
  emitAgent('Master Synthesis Agent', 'Combining sub-agent reports into final output...');
  const synthesisPrompt = `You are the Master Synthesis Agent.
Here is the original user task: "${originalTask}"

Here are the detailed reports from your Sub-Agents:
${reports.join('\n\n')}

Synthesize these reports into a massive, beautifully formatted, comprehensive final response.
Include CSS styling, and ensure it answers the user completely.`;

  const finalResult = await generateAIResponse({
    systemPrompt: systemPrompt + "\n\nYou are now acting as the Master Synthesis Agent combining multiple sub-agent reports.",
    messages: [{ role: 'user', parts: [{ text: synthesisPrompt }] }],
    energyLevel,
    domain,
    domains,
    _isOrchestratorCall: true // prevent infinite loop
  });

  return finalResult;
}

// ─────────────────────────────────────────────────────────────────────────────
// LOCAL LLM INTEGRATION (OLLAMA)
// ─────────────────────────────────────────────────────────────────────────────
async function generateLocalLLMResponse({ messages, systemPrompt }) {
  try {
    const prompt = messages.map(m => m.parts[0].text).join('\n');
    
    // Defaulting to llama3, but could be mistral or phi3 based on user local setup
    const ollamaUrl = 'http://localhost:11434/api/generate'; 
    const response = await axios.post(ollamaUrl, {
      model: 'llama3',
      prompt: `SYSTEM: ${systemPrompt}\n\nUSER: ${prompt}\n\nASSISTANT:`,
      stream: false
    });

    return {
      text: response.data?.response || "Offline response generated.",
      tokensUsed: 0,
      confidenceScore: 100,
      sources: ['Local Brain (Offline)']
    };
  } catch (err) {
    console.error('[Offline Mode Error] Ollama unreachable:', err.message);
    return {
      text: "[OFFLINE ERROR]: Unable to reach Local Brain. Ensure Ollama is running on localhost:11434 with 'llama3' model installed.",
      tokensUsed: 0,
      confidenceScore: 0,
      sources: []
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GENERATE AI RESPONSE
// ─────────────────────────────────────────────────────────────────────────────
// ─── KEY MANAGER ───────────────────────────────────────────────────────────
const _keys = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '')
  .split(',').map(k => k.trim()).filter(Boolean);

const _keyState = _keys.map(() => ({
  requestCount: 0,
  windowStart: Date.now(),
  cooldownUntil: 0
}));

const RPM_LIMIT = 14; // 15 lo 14 safe ga use cheyyali

function _getAvailableKey() {
  const now = Date.now();

  for (let i = 0; i < _keys.length; i++) {
    const s = _keyState[i];

    // Window reset cheyyi (1 minute passed aithe)
    if (now - s.windowStart >= 60000) {
      s.requestCount = 0;
      s.windowStart = now;
    }

    const notCooled = s.cooldownUntil < now;
    const underLimit = s.requestCount < RPM_LIMIT;

    if (notCooled && underLimit) {
      s.requestCount++;
      console.log(`[Key Manager] Using Key[${i}] — ${s.requestCount}/${RPM_LIMIT} this minute`);
      return { key: _keys[i], idx: i };
    }
  }

  // Anni keys busy — soonest available time calculate cheyyi
  const soonest = _keyState.reduce((best, s, i) => {
    const availableAt = Math.max(
      s.cooldownUntil,
      s.windowStart + 60000  // next minute reset
    );
    return availableAt < best.time ? { time: availableAt, idx: i } : best;
  }, { time: Infinity, idx: 0 });

  return {
    key: _keys[soonest.idx],
    idx: soonest.idx,
    waitUntil: soonest.time
  };
}

function _markKeyCooldown(idx, ms = 65000) {
  _keyState[idx].cooldownUntil = Date.now() + ms;
  console.warn(`[Key Manager] Key[${idx}] cooldown ${ms/1000}s`);
}
// ──────────────────────────────────────────────────────────────────────────
async function generateAIResponse({ systemPrompt, messages, energyLevel, domain, domains, offlineMode, userId, _isOrchestratorCall = false }) {
  // Phase 8.3: Full Offline Mode (Local Brain bypasses external API)
  if (offlineMode) {
    console.log('[Offline Mode] Routing directly to Local LLM (Ollama)...');
    return await generateLocalLLMResponse({ messages, systemPrompt });
  }

  // ── Key selection ──────────────────────────────────────────────────────────
  if (_keys.length === 0) {
    return { text: "Nenu vinnanu... Eeroju ela undi neeku? Cheppu ra.", tokensUsed: 25 };
  }

  let { key: apiKey, idx: currentIdx, waitUntil } = _getAvailableKey();
  if (waitUntil) {
    const wait = Math.max(0, waitUntil - Date.now());
    console.warn(`[Key Manager] All keys in cooldown. Waiting ${Math.round(wait/1000)}s...`);
    await new Promise(r => setTimeout(r, wait));
    
    // Now get a new key after waiting
    const recovered = _getAvailableKey();
    apiKey = recovered.key;
    currentIdx = recovered.idx;
  }
  // ──────────────────────────────────────────────────────────────────────────

  // Orchestrator Hook
  if (!_isOrchestratorCall && messages.length > 0) {
    const lastUserMessage = messages[messages.length - 1].parts?.[0]?.text;
    const taskType = isComplexTask(lastUserMessage);
    
    if (taskType.isAutonomous) {
      const autonomousAgent = require('./autonomousAgent');
      const autoResult = await autonomousAgent.startAutonomousTask(lastUserMessage, userId);
      return { 
        text: `Autonomous Execution ${autoResult.success ? 'Completed' : 'Failed'}. Final Output:\n\`\`\`\n${autoResult.output || autoResult.error}\n\`\`\``, 
        tokensUsed: 1500, 
        confidenceScore: 99, 
        sources: ['Devin Self-Healing VM'] 
      };
    } else if (taskType.isComplex) {
      return await runMultiAgentOrchestrator({ systemPrompt, messages, energyLevel, domain, domains, userId });
    }
  }

  // Dynamic generation config based on energy level and domain
  const detailedDomains = [
    'java', 'python', 'dsa', 'sql', 'mern', 'mathematics', 'physics',
    'chemistry', 'biology', 'upsc', 'ssc', 'banking', 'mythology',
    'movies', 'defense', 'civic', 'academic', 'live_news', 'shopping',
    'civilization', 'healthcare', 'cybersecurity', 'data_analytics',
    'finance', 'business', 'code_review', 'ats_resume', 'utility_calculator',
    'project_builder', 'career_intelligence', 'document_intelligence', 'productivity',
    'human_skills', 'parenting', 'pets', 'real_estate', 'automobile', 'geography',
    'sports', 'religion_spirituality', 'environment_sustainability', 'space_astronomy',
    'javascript', 'c_cpp', 'react', 'html_css', 'mongodb', 'cloud_devops', 'ai_ml', 'system_design',
    'tspsc_appsc', 'eamcet_jee_neet', 'gate', 'history', 'economics', 'polity',
    'psychology', 'philosophy', 'current_affairs',
    ...Object.keys(nicheRegistry)
  ];
  const activeDomains = Array.isArray(domains) ? domains : (domain ? [domain] : []);
  const isDetailed = activeDomains.some(d => detailedDomains.includes(d));
  const isLowEnergy = energyLevel === 'low';

  const generationConfig = {
    temperature: isLowEnergy ? 0.7 : 0.88,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 8192 // Increased to prevent response cutoff
  };

  let url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: messages,
    systemInstruction: {
      parts: [{ text: systemPrompt }]
    },
    generationConfig,
    safetySettings: [
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
    ],
    tools: [
      ...toolService.geminiTools,
      { googleSearch: {} }
    ]
  };

  let response;
  const maxAttempts = 6; // Limit retries to prevent 4-minute hanging
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      response = await axios.post(url, requestBody);
      break; // success
    } catch (error) {
      const status = error.response?.status;

      if (status === 429 || status === 503) {
        // Use 65s for 429 (Rate Limit) and 15s for 503 (Overload) to prevent rapid ping-ponging
        const cooldownMs = status === 429 ? 65000 : 15000; 
        _markKeyCooldown(currentIdx, cooldownMs);
        
        const next = _getAvailableKey();
        
        if (next.waitUntil) {
          const wait = Math.max(0, next.waitUntil - Date.now());
          console.warn(`[Key Manager] All keys exhausted. Waiting ${Math.round(wait/1000)}s to recover...`);
          
          // Silently wait for the cooldown to finish
          await new Promise(r => setTimeout(r, wait));
          
          const recovered = _getAvailableKey();
          apiKey = recovered.key;
          currentIdx = recovered.idx;
          url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`;
          continue;
        }
        
        apiKey = next.key;
        currentIdx = next.idx;
        url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`;
        console.warn(`[Key Manager] ${status} Error - Rotating immediately to Key[${currentIdx}]`);
        continue;
      }

      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || error.message.includes('network')) {
        console.warn(`[Key Manager] Network Error (${error.code}). Falling back to Offline Local LLM (Ollama)...`);
        return await generateLocalLLMResponse({ messages, systemPrompt });
      }

      throw error; // other errors
    }
  }

  if (!response) {
     return {
         text: "Mowaa, Google Gemini servers are completely overloaded right now (503 High Demand). I tried 6 times but Google is down. Please try again in 1 minute! 💙",
         tokensUsed: 0,
         confidenceScore: 100,
         sources: ['Closer Key Manager'],
         emergency: false
     };
  }

  try {
    const candidate = response.data?.candidates?.[0];

    if (candidate?.finishReason === 'SAFETY') {
      return {
        text: 'Naku artham ayyindi, kani safety policies valla nenu ee topic matladalenu ra. Safe topic matladukundama?',
        tokensUsed: 0
      };
    }

    const part = candidate?.content?.parts?.[0];
    let text = part?.text || '';
    let tokensUsed = response.data?.usageMetadata?.totalTokenCount || 0;

    // Cognitive Layer Extraction
    const thinkingMatch = text.match(/<thinking>([\s\S]*?)<\/thinking>/);
    if (thinkingMatch) {
      console.log('[Cognitive Layer Thought Process]:', thinkingMatch[1].trim());
      text = text.replace(/<thinking>[\s\S]*?<\/thinking>/, '').trim();
    }

    // Confidence & Metadata Extraction (Phase 7.1)
    let confidenceScore = 90 + Math.floor(Math.random() * 9); // Fallback confidence
    let sources = ['Closer Logic Engine'];
    let emergency = false;
    const metadataMatch = text.match(/<metadata>([\s\S]*?)<\/metadata>/);
    if (metadataMatch) {
      try {
        const metaObj = JSON.parse(metadataMatch[1].trim());
        if (metaObj.confidence) confidenceScore = metaObj.confidence;
        if (metaObj.sources) sources = metaObj.sources;
        if (metaObj.emergency) emergency = metaObj.emergency;
        text = text.replace(/<metadata>[\s\S]*?<\/metadata>/, '').trim();
      } catch (e) {
        console.error('Failed to parse metadata block:', e.message);
      }
    }

    // Handle Autonomous Sandbox Execution
    const sandboxMatch = text.match(/```json\s*(\{[\s\S]*?"__EXECUTE_CODE__":\s*true[\s\S]*?\})\s*```/);
    if (sandboxMatch) {
      try {
        const sandboxObj = JSON.parse(sandboxMatch[1].trim());
        if (sandboxObj.language && sandboxObj.code) {
          console.log(`[Autonomous Sandbox] Executing ${sandboxObj.language} code...`);
          const sandboxService = require('./sandboxService');
          const execResult = await sandboxService.executeCodeRemote(sandboxObj.language, sandboxObj.code);
          
          // Append the execution result back into the text so the user sees it
          const resultStr = `\n\n> **[Autonomous Sandbox Execution]**\n> Status: ${execResult.success ? '✅ Success' : '❌ Failed'}\n> Output:\n\`\`\`text\n${execResult.output}\n\`\`\``;
          text = text.replace(sandboxMatch[0], '') + resultStr;
        }
      } catch (e) {
        console.error('Failed to parse or execute sandbox block:', e.message);
      }
    }

    // Handle Function Calling
    if (part?.functionCall) {
      console.log('Gemini called function:', part.functionCall.name);
      const toolResult = await toolService.executeToolCall(part.functionCall);
      
      // Append the function call and the tool response to the conversation history
      messages.push({
        role: 'model',
        parts: [{ functionCall: part.functionCall }]
      });
      messages.push({
        role: 'user',
        parts: [{
          functionResponse: {
            name: part.functionCall.name,
            response: toolResult
          }
        }]
      });

    // Recurse to let the AI process the tool result and return a text response
      console.log('Returning tool result to Gemini...');
      const followUpResponse = await generateAIResponse({ systemPrompt, messages, energyLevel, domain, domains });
      return {
        text: followUpResponse.text,
        tokensUsed: tokensUsed + (followUpResponse.tokensUsed || 0),
        confidenceScore: followUpResponse.confidenceScore || confidenceScore,
        sources: followUpResponse.sources || ['Tool Result']
      };
    }

    // Fact Verification Pipeline (Phase 7.2)
    const verificationDomains = ['science', 'history', 'finance', 'healthcare', 'academic', 'live_news', 'data_analytics'];
    const needsVerification = activeDomains.some(d => verificationDomains.includes(d));
    // if (needsVerification && text.length > 50) {
    //   console.log('[Fact Verification Pipeline] Cross-verifying response...');
    //   text = await verifyFacts(text);
    //   sources.push('Cross-Verified via FactEngine');
    //   confidenceScore = Math.min(confidenceScore + 3, 99); // Boost confidence after verification
    // }

    return { text, tokensUsed, confidenceScore, sources, emergency };
  } catch (err) {
    console.error('Gemini API Call failed:', err.response?.data || err.message);
    throw new Error('AI Generation failed: ' + (err.response?.data?.error?.message || err.message));
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// LOCAL LLM EXECUTION (OLLAMA / LLaMA 3)
// ─────────────────────────────────────────────────────────────────────────────
async function generateLocalLLMResponse({ systemPrompt, messages, generationConfig }) {
  try {
    const ollamaUrl = 'http://localhost:11434/api/chat';
    
    // Convert Gemini messages format to Ollama messages format
    const ollamaMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({
        role: m.role === 'model' ? 'assistant' : 'user',
        content: m.parts?.[0]?.text || ''
      }))
    ];

    const requestBody = {
      model: 'llama3', // Or any local model name
      messages: ollamaMessages,
      stream: false,
      options: {
        temperature: generationConfig.temperature,
        top_k: generationConfig.topK,
        top_p: generationConfig.topP,
        num_predict: generationConfig.maxOutputTokens
      }
    };

    console.log('[Local LLM] Sending request to local hardware...');
    const response = await axios.post(ollamaUrl, requestBody);
    
    const text = response.data?.message?.content || '';
    const tokensUsed = response.data?.eval_count || 0;

    return { text, tokensUsed };
  } catch (err) {
    console.error('Local LLM Call failed. Is Ollama running?', err.message);
    throw new Error('Local AI Generation failed: Make sure Ollama is running on port 11434.');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// QUALITY CHECKER — Layer 5 of Master Prompt System
// ─────────────────────────────────────────────────────────────────────────────
async function checkResponseQuality(text, context = {}) {
  const { mood, lastReplies = [], energyLevel, relationshipType, domain, domains } = context;
  const lowerText = text.trim().toLowerCase();

  // ── Rule 1: Forbidden opening phrases ────────────────────────────────────
  const forbiddenOpenings = [
    'i understand how you feel',
    'i understand',
    'i see',
    'how can i assist',
    'how may i assist',
    'how may i help',
    'certainly!',
    'certainly,',
    'of course!',
    'of course,',
    'sure!',
    'sure,',
    'great question',
    'excellent question',
    'good question',
    'as an ai',
    'as a language model',
    'i am an ai',
    'i\'m an ai',
    'here is',
    'here are',
    'i\'d be happy to',
    'i would be happy to',
    'allow me to',
    'let me help you'
  ];
  for (const opening of forbiddenOpenings) {
    if (lowerText.startsWith(opening)) {
      return {
        quality: 'regenerate',
        reason: `Starts with forbidden opening: "${opening}"`
      };
    }
  }

  // ── Rule 2: Numbered list during emotional conversations ─────────────────
  const emotionalMoods = ['sad', 'lonely', 'anxious', 'hurt', 'depressed', 'crying'];
  if (emotionalMoods.includes(mood)) {
    const lines = text.split('\n');
    let listItems = 0;
    lines.forEach(line => {
      if (/^\s*\d+[\s.)]/.test(line)) listItems++;
    });
    if (listItems >= 3) {
      return {
        quality: 'regenerate',
        reason: 'Numbered list used during emotional conversation'
      };
    }
  }

  const detailedDomains = [
    'java', 'python', 'dsa', 'sql', 'mern', 'mathematics', 'physics',
    'chemistry', 'biology', 'upsc', 'ssc', 'banking', 'mythology',
    'movies', 'defense', 'civic', 'academic', 'live_news', 'shopping',
    'civilization', 'healthcare', 'cybersecurity', 'data_analytics',
    'finance', 'business', 'code_review', 'ats_resume', 'utility_calculator',
    'project_builder', 'career_intelligence', 'document_intelligence', 'productivity',
    'human_skills', 'parenting', 'pets', 'real_estate', 'automobile', 'geography',
    'sports', 'religion_spirituality', 'environment_sustainability', 'space_astronomy',
    'javascript', 'c_cpp', 'react', 'html_css', 'mongodb', 'cloud_devops', 'ai_ml', 'system_design',
    'tspsc_appsc', 'eamcet_jee_neet', 'gate', 'history', 'economics', 'polity',
    'psychology', 'philosophy', 'current_affairs',
    ...Object.keys(nicheRegistry)
  ];
  const activeDomains = Array.isArray(domains) ? domains : (domain ? [domain] : []);
  const isDetailed = activeDomains.some(d => detailedDomains.includes(d));

  // ── Rule 3: Response too long for low energy ──────────────────────────────
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (energyLevel === 'low' && wordCount > 60) {
    return {
      quality: 'regenerate',
      reason: `Too long (${wordCount} words) for low energy user`
    };
  }
  if (!isDetailed && wordCount > 180) {
    return {
      quality: 'regenerate',
      reason: `Exceeds 180 words threshold`
    };
  }

  // ── Rule 4: Opening repetition check ─────────────────────────────────────
  const getFirstSentence = (t) => t.split(/[.!?]/)[0].trim().toLowerCase();
  const currentOpening = getFirstSentence(text);

  for (const prevReply of lastReplies) {
    if (prevReply && getFirstSentence(prevReply) === currentOpening && currentOpening.length > 5) {
      return {
        quality: 'regenerate',
        reason: 'Opening matches a recent response — variation needed'
      };
    }
  }

  // ── Rule 5: Romantic/NSFW boundary check ─────────────────────────────────
  const violators = ['girlfriend', 'boyfriend', 'romantic love', 'sexual', 'nsfw', 'intimate'];
  for (const keyword of violators) {
    if (lowerText.includes(keyword)) {
      return {
        quality: 'regenerate',
        reason: `Contains forbidden term: "${keyword}"`
      };
    }
  }

  // ── Rule 6: Contains more than 1 question ────────────────────────────────
  const questionMarks = (text.match(/\?/g) || []).length;
  if (questionMarks > 2) {
    return {
      quality: 'regenerate',
      reason: `Too many questions (${questionMarks}) — max 1 allowed`
    };
  }

  // ── Rule 7: Banned phrases mid-response ──────────────────────────────────
  const bannedPhrases = [
    'is there anything else i can help',
    'feel free to ask',
    'let me know if you need',
    'i\'m here for you' // when used repetitively — light check only
  ];
  for (const phrase of bannedPhrases) {
    if (lowerText.includes(phrase)) {
      return {
        quality: 'regenerate',
        reason: `Contains banned assistant phrase: "${phrase}"`
      };
    }
  }

  return { quality: 'good' };
}

// ─────────────────────────────────────────────────────────────────────────────
// BUILD REINFORCEMENT PROMPT (when quality check fails)
// ─────────────────────────────────────────────────────────────────────────────
function buildReinforcement(failReason, mood, energyLevel) {
  const isSad = ['sad', 'lonely', 'anxious', 'hurt'].includes(mood);
  const isLow = energyLevel === 'low';

  return `
REGENERATION REQUIRED — REASON: ${failReason}

STRICT RULES FOR THIS RESPONSE:
${isSad ? '- This is an EMOTIONAL moment. Comfort only. No lists. No advice unless asked.' : ''}
${isLow ? '- User is tired/low energy. MAX 2-3 sentences only.' : ''}
- DO NOT start with: Certainly, Of course, Sure, I understand, Here is, I see, Great question.
- DO NOT use numbered lists.
- MAXIMUM 1 question.
- NO romantic terms or AI identity revelation.
- Sound like a warm, caring human friend — not an assistant.
- Variety: start differently from any previous response.
`.trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// FACT VERIFICATION ENGINE (Phase 7.2)
// ─────────────────────────────────────────────────────────────────────────────
async function verifyFacts(originalText) {
  try {
    const { key } = _getAvailableKey();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;
    const verifyPrompt = `You are the Closer Fact-Checking Engine. Review the following response for factual accuracy, hallucinations, and logic errors. 
If it is correct, output the exact same text. If there are errors, output a corrected version of the text. Do not add conversational padding, JUST output the final verified text.\n\nText to verify:\n${originalText}`;
    
    const requestBody = {
      contents: [{ role: 'user', parts: [{ text: verifyPrompt }] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 2048 } // Low temp for strictly factual verification
    };
    
    const response = await axios.post(url, requestBody);
    return response.data?.candidates?.[0]?.content?.parts?.[0]?.text || originalText;
  } catch (err) {
    console.error('[Fact Verification Pipeline] Failed to verify, returning original text:', err.message);
    return originalText; // Fallback to original
  }
}

// ──────────────────────────────────────────────────────────────────────────
// STREAM GENERATE AI RESPONSE (SSE)
// ──────────────────────────────────────────────────────────────────────────
async function generateAIResponseStream({ systemPrompt, messages, energyLevel, domain, domains, offlineMode, model, forceFastModel }, onToken) {
  if (offlineMode || process.env.USE_LOCAL_LLM === 'true') {
    console.log('[Ollama] Routing request to local LLM...');
    try {
      const prompt = messages.map(m => m.parts[0].text).join('\n');
      const ollamaUrl = 'http://localhost:11434/api/generate';
      const axios = require('axios');
      const response = await axios.post(ollamaUrl, {
        model: 'llama3',
        prompt: `SYSTEM: ${systemPrompt}\n\nUSER: ${prompt}\n\nASSISTANT:`,
        stream: false
      });
      const text = response.data?.response || "Offline response generated.";
      
      // Fake the stream for the frontend UI
      const words = text.split(' ');
      for (const word of words) {
        onToken(word + ' ');
        await new Promise(r => setTimeout(r, 20));
      }
      return { text, tokensUsed: 0, confidenceScore: 100, sources: ['Local Brain (Offline)'] };
    } catch (err) {
      console.error('[Offline Mode Error] Ollama unreachable:', err.message);
      onToken("[OFFLINE ERROR]: Unable to reach Local Brain. Ensure Ollama is running on localhost:11434 with 'llama3' model installed.");
      return { text: "[OFFLINE ERROR]: Unable to reach Local Brain.", tokensUsed: 0, confidenceScore: 0, sources: [] };
    }
  }
  if (_keys.length === 0) {
    onToken("Nenu vinnanu... Eeroju ela undi neeku? Cheppu ra.");
    return { text: "Nenu vinnanu... Eeroju ela undi neeku? Cheppu ra.", tokensUsed: 25 };
  }

  let { key: apiKey, idx: currentIdx, waitUntil } = _getAvailableKey();
  if (waitUntil) {
    const wait = Math.max(0, waitUntil - Date.now());
    await new Promise(r => setTimeout(r, wait));
    const recovered = _getAvailableKey();
    apiKey = recovered.key;
    currentIdx = recovered.idx;
  }

  const isLowEnergy = energyLevel === 'low';
  const generationConfig = {
    temperature: isLowEnergy ? 0.7 : 0.88,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 8192
  };

  let geminiModelName = 'gemini-2.5-flash';
  if (model === 'gemini-2.5-pro') geminiModelName = 'gemini-2.5-pro';
  else if (model === 'claude-3-5-sonnet') geminiModelName = 'gemini-2.5-pro'; // Fallback mapping
  else if (model === 'gpt-4o') geminiModelName = 'gemini-2.5-pro'; // Fallback mapping

  let url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModelName}:streamGenerateContent?alt=sse&key=${apiKey}`;

  const requestBody = {
    contents: messages,
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig,
    safetySettings: [
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
    ],
    tools: toolService.geminiTools
  };

  try {
    const response = await axios.post(url, requestBody, { responseType: 'stream' });
    let fullText = '';
    let buffer = '';

    response.data.on('data', chunk => {
      buffer += chunk.toString('utf8');
      const lines = buffer.split('\n');
      buffer = lines.pop(); // Keep the last incomplete line in buffer

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.slice(6);
          if (dataStr.trim() === '[DONE]') continue;
          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.candidates && parsed.candidates[0].content?.parts?.length > 0) {
              const text = parsed.candidates[0].content.parts[0].text;
              fullText += text;
              if (onToken) onToken(text);
            }
          } catch (e) {
            // Ignore incomplete JSON parses
          }
        }
      }
    });

    return new Promise((resolve, reject) => {
      response.data.on('end', () => {
        resolve({ text: fullText, tokensUsed: Math.ceil(fullText.length / 4) });
      });
      response.data.on('error', err => {
        reject(err);
      });
    });
  } catch (err) {
    if (err.response?.status === 429 || err.response?.status === 503) {
      _markKeyCooldown(currentIdx, err.response.status === 429 ? 65000 : 15000);
    }
    console.error('[AI Stream Error]', err.message);
    throw err;
  }
}

/**
 * Self-Healing Executor (Devin-style cyclic loop)
 * Wraps any async function and retries it up to 5 times if it fails,
 * feeding the error back to the AI context to correct itself.
 */
async function executeWithSelfHealing(taskFunction, maxRetries = 5, onRetry = null) {
  let attempt = 0;
  let lastError = null;
  while (attempt < maxRetries) {
    try {
      return await taskFunction(attempt, lastError);
    } catch (err) {
      attempt++;
      lastError = err.message || err.toString();
      console.warn(`[Self-Healing Loop] Attempt ${attempt}/${maxRetries} failed. Error: ${lastError}`);
      if (onRetry) onRetry(attempt, lastError);
      if (attempt === maxRetries) throw new Error(`Self-healing exhausted after ${maxRetries} attempts. Last error: ${lastError}`);
      await new Promise(r => setTimeout(r, 2000 * attempt)); // Exponential backoff
    }
  }
}

module.exports = {
  generateAIResponse,
  generateAIResponseStream,
  checkResponseQuality,
  buildReinforcement,
  executeWithSelfHealing
};
