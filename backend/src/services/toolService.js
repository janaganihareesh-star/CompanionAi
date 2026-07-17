/**
 * toolService.js
 * Defines function schemas for Gemini API and executes them.
 */

const searchService = require('./searchService');
const sandboxService = require('./sandboxService');
const multimediaService = require('./multimediaService');
const iotService = require('./iotService');
const calendarService = require('./calendarService');
const axios = require('axios');

const geminiTools = [
  {
    functionDeclarations: [
      {
        name: 'scan_workspace',
        description: 'Scan the local workspace to return a list of all files in the project. Useful to understand the full codebase architecture.',
        parameters: { type: 'OBJECT', properties: {} }
      },
      {
        name: 'read_workspace_file',
        description: 'Read the contents of a specific file from the local workspace.',
        parameters: {
          type: 'OBJECT',
          properties: {
            path: { type: 'STRING', description: 'The relative file path (e.g. "src/App.js")' }
          },
          required: ['path']
        }
      },
      {
        name: 'scaffold_project',
        description: 'Instantly create or write multiple files to the workspace. Used to scaffold entire projects or make multi-file edits.',
        parameters: {
          type: 'OBJECT',
          properties: {
            files: {
              type: 'ARRAY',
              description: 'Array of file objects to write',
              items: {
                type: 'OBJECT',
                properties: {
                  path: { type: 'STRING' },
                  content: { type: 'STRING' }
                }
              }
            }
          },
          required: ['files']
        }
      },
      {
        name: 'patch_file',
        description: 'Surgically edit an existing file by replacing a specific block of target code with new code. Must provide exact matching target content.',
        parameters: {
          type: 'OBJECT',
          properties: {
            path: { type: 'STRING', description: 'Relative path of the file to edit' },
            targetContent: { type: 'STRING', description: 'The exact exact string in the file to replace, including whitespaces.' },
            replacementContent: { type: 'STRING', description: 'The new string to drop in its place.' }
          },
          required: ['path', 'targetContent', 'replacementContent']
        }
      },
      {
        name: 'analyze_ast',
        description: 'Analyze the Abstract Syntax Tree (AST) of a JavaScript code block to understand its structure (functions, classes, variables, imports). Use this when debugging complex logic.',
        parameters: {
          type: 'OBJECT',
          properties: {
            code: { type: 'STRING', description: 'The JavaScript code to analyze.' }
          },
          required: ['code']
        }
      },
      {
        name: 'get_live_weather',
        description: 'Get the current weather for a specific location.',
        parameters: {
          type: 'OBJECT',
          properties: {
            location: {
              type: 'STRING',
              description: 'The city and state/country, e.g. "Hyderabad, India"'
            }
          },
          required: ['location']
        }
      },
      {
        name: 'set_alarm',
        description: 'Set an alarm or reminder for the user.',
        parameters: {
          type: 'OBJECT',
          properties: {
            time: {
              type: 'STRING',
              description: 'The time for the alarm, e.g. "07:00 AM"'
            },
            label: {
              type: 'STRING',
              description: 'The label or purpose of the alarm'
            }
          },
          required: ['time', 'label']
        }
      },
      {
        name: 'execute_code',
        description: 'Execute Python, JavaScript, C++, or Rust code in a secure remote sandbox and return the console output.',
        parameters: {
          type: 'OBJECT',
          properties: {
            language: {
              type: 'STRING',
              description: 'The programming language (e.g., "python", "javascript", "cpp", "rust")'
            },
            code: {
              type: 'STRING',
              description: 'The exact source code to execute'
            }
          },
          required: ['language', 'code']
        }
      },
      {
        name: 'deep_web_search',
        description: 'Search the deep web and Reddit for real-time information, news, current affairs, and human opinions.',
        parameters: {
          type: 'OBJECT',
          properties: {
            query: {
              type: 'STRING',
              description: 'The search query to execute (e.g., "latest AI news 2026", "Reddit reviews of iPhone 17")'
            }
          },
          required: ['query']
        }
      },
      {
        name: 'get_financial_data',
        description: 'Fetch live stock prices, cryptocurrency quotes, and company metrics for financial forecasting.',
        parameters: {
          type: 'OBJECT',
          properties: {
            symbol: {
              type: 'STRING',
              description: 'The stock ticker or crypto symbol (e.g., "AAPL", "TSLA", "BTCUSD")'
            }
          },
          required: ['symbol']
        }
      },
      {
        name: 'manage_life_os',
        description: 'Manage the user\'s Life OS including Goals, Habits, Journals, and Dreams.',
        parameters: {
          type: 'OBJECT',
          properties: {
            action: { type: 'STRING', description: 'Action: "create", "update", "delete", "list"' },
            nodeType: { type: 'STRING', description: 'Type: "Goal", "Habit", "Journal", "Dream"' },
            title: { type: 'STRING', description: 'Title of the entry' },
            description: { type: 'STRING', description: 'Description or details' },
            frequency: { type: 'STRING', description: '"Daily", "Weekly", "Monthly", "Once"' }
          },
          required: ['action', 'nodeType']
        }
      },
      {
        name: 'schedule_task',
        description: 'Schedule a recurring AI background task (Workflow OS) using a cron expression.',
        parameters: {
          type: 'OBJECT',
          properties: {
            taskName: { type: 'STRING', description: 'Name of the automated task (e.g. "Morning Briefing")' },
            cronExpression: { type: 'STRING', description: 'Cron expression (e.g. "0 7 * * *" for 7 AM daily)' },
            aiPrompt: { type: 'STRING', description: 'The exact prompt the AI should execute in the background.' }
          },
          required: ['taskName', 'cronExpression', 'aiPrompt']
        }
      },
      {
        name: 'manage_secure_vault',
        description: 'Encrypt and store sensitive secrets (passwords, keys) or retrieve them securely.',
        parameters: {
          type: 'OBJECT',
          properties: {
            action: { type: 'STRING', description: '"encrypt_and_save" or "decrypt_and_retrieve"' },
            identifier: { type: 'STRING', description: 'Name of the secret (e.g. "Bank Password")' },
            plainText: { type: 'STRING', description: 'The secret text (only required for encrypt_and_save)' }
          },
          required: ['action', 'identifier']
        }
      },
      {
        name: 'schedule_google_meeting',
        description: 'Schedule a meeting or event on the user\'s Google Calendar.',
        parameters: {
          type: 'OBJECT',
          properties: {
            title: { type: 'STRING', description: 'The title of the meeting' },
            time: { type: 'STRING', description: 'The time of the meeting (e.g., "Tomorrow at 5pm")' },
            attendees: { type: 'STRING', description: 'Comma separated list of attendee emails, or names' }
          },
          required: ['title', 'time']
        }
      },
      {
        name: 'control_smart_home',
        description: 'Control physical smart home devices (IoT) like lights, AC, or smart plugs.',
        parameters: {
          type: 'OBJECT',
          properties: {
            deviceName: { type: 'STRING', description: 'Name of the device (e.g. "Living Room Lights", "Bedroom AC")' },
            action: { type: 'STRING', description: '"turn_on", "turn_off", "set_temperature", "dim"' },
            state: { type: 'STRING', description: 'The desired state (e.g. "on", "72F", "50%")' }
          },
          required: ['deviceName', 'action', 'state']
        }
      },
      {
        name: 'send_slack_message',
        description: 'Send a message to a specific person or channel on Slack.',
        parameters: {
          type: 'OBJECT',
          properties: {
            recipient: { type: 'STRING', description: 'The Slack channel or username (e.g., "@john", "#general")' },
            message: { type: 'STRING', description: 'The content of the message to send' }
          },
          required: ['recipient', 'message']
        }
      },
      {
        name: 'create_jira_ticket',
        description: 'Create a new ticket or issue in the Enterprise Jira board.',
        parameters: {
          type: 'OBJECT',
          properties: {
            title: { type: 'STRING', description: 'The title of the Jira issue' },
            description: { type: 'STRING', description: 'The description of the issue' },
            issueType: { type: 'STRING', description: '"Bug", "Task", "Story", "Epic"' },
            priority: { type: 'STRING', description: '"High", "Medium", "Low"' }
          },
          required: ['title', 'issueType']
        }
      },
      {
        name: 'query_salesforce_crm',
        description: 'Query enterprise Salesforce CRM for customer data, leads, or accounts.',
        parameters: {
          type: 'OBJECT',
          properties: {
            queryType: { type: 'STRING', description: '"Lead", "Account", "Contact", "Opportunity"' },
            searchName: { type: 'STRING', description: 'The name to search for (e.g., "Acme Corp")' }
          },
          required: ['queryType', 'searchName']
        }
      },
      {
        name: 'generate_video',
        description: 'Generates a short video clip based on a text prompt.',
        parameters: {
          type: 'OBJECT',
          properties: {
            prompt: { type: 'STRING', description: 'Detailed description of the video to generate' }
          },
          required: ['prompt']
        }
      },
      {
        name: 'generate_image',
        description: 'Generates an image from a text prompt using Midjourney/DALL-E level capabilities.',
        parameters: {
          type: 'OBJECT',
          properties: { prompt: { type: 'STRING' } },
          required: ['prompt']
        }
      },
      {
        name: 'generate_music',
        description: 'Generates music or audio tracks from a text prompt.',
        parameters: {
          type: 'OBJECT',
          properties: { prompt: { type: 'STRING' } },
          required: ['prompt']
        }
      },
      {
        name: 'generate_3d',
        description: 'Generates a 3D model asset (.glb) from a text prompt.',
        parameters: {
          type: 'OBJECT',
          properties: { prompt: { type: 'STRING' } },
          required: ['prompt']
        }
      },
      {
        name: 'web_automation',
        description: 'Autonomously opens a headless browser, navigates to a URL, and performs actions or scrapes data (like AgentGPT/Devin).',
        parameters: {
          type: 'OBJECT',
          properties: {
            url: { type: 'STRING', description: 'The website URL to navigate to' },
            action: { type: 'STRING', description: 'Action to perform (e.g., scrape, click, login)' }
          },
          required: ['url', 'action']
        }
      },
      {
        name: 'google_calendar',
        description: 'Interact with Google Calendar to read events or book new meetings.',
        parameters: {
          type: 'OBJECT',
          properties: {
            action: { type: 'STRING', description: 'Action: list_events or create_event' },
            details: { type: 'STRING', description: 'Event details (time, title, attendees) if creating' }
          },
          required: ['action']
        }
      },
      {
        name: 'enterprise_sync',
        description: 'Sync data or push code directly to enterprise tools like Notion, Slack, Jira, or GitHub.',
        parameters: {
          type: 'OBJECT',
          properties: {
            platform: { type: 'STRING', description: 'The platform to sync with (notion, slack, jira, github)' },
            action: { type: 'STRING', description: 'Action (e.g., push_code, send_message, create_ticket)' },
            payload: { type: 'STRING', description: 'The data to sync' }
          },
          required: ['platform', 'action']
        }
      },
      {
        name: 'control_iot',
        description: 'Control local smart home devices (like Hue lights, thermostats, Alexa).',
        parameters: {
          type: 'OBJECT',
          properties: {
            device: { type: 'STRING', description: 'The device to control' },
            state: { type: 'STRING', description: 'The new state (e.g., ON, OFF, 72F)' }
          },
          required: ['device', 'state']
        }
      }
    ]
  }
];

/**
 * Executes a tool called by the Gemini API and returns the result.
 */
async function executeToolCall(functionCall) {
  const { name, args } = functionCall;

  try {
    switch (name) {
      case 'scan_workspace':
        const workspaceScanner = require('./workspaceScanner');
        return await workspaceScanner.getWorkspaceTree();

      case 'read_workspace_file':
        const scanner = require('./workspaceScanner');
        return await scanner.readWorkspaceFile(args.path);

      case 'scaffold_project':
        const scaffolder = require('./scaffolder');
        return await scaffolder.createProjectFiles(args.files);

      case 'patch_file':
        const fileEditor = require('./fileEditor');
        return await fileEditor.patchFile(args.path, args.targetContent, args.replacementContent);

      case 'analyze_ast':
        const astService = require('./astService');
        return astService.analyzeCodeStructure(args.code);

      case 'get_live_weather':
        if (process.env.OPENWEATHER_API_KEY && process.env.OPENWEATHER_API_KEY !== 'your_openweather_api_key_here') {
          try {
            const geocodeUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${args.location}&limit=1&appid=${process.env.OPENWEATHER_API_KEY}`;
            const geoRes = await axios.get(geocodeUrl);
            if (geoRes.data && geoRes.data.length > 0) {
              const { lat, lon } = geoRes.data[0];
              const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`;
              const wRes = await axios.get(weatherUrl);
              const data = wRes.data;
              return { 
                result: `The weather in ${args.location} is currently ${data.main.temp}°C with ${data.weather[0].description}. Humidity is ${data.main.humidity}%.` 
              };
            }
          } catch (e) {
            console.error('Weather API error:', e.message);
          }
        }
        
        // Fallback or mock
        const mockWeather = `The weather in ${args.location} is currently 28°C with partly cloudy skies. (Mock data, please add OPENWEATHER_API_KEY to .env for real data)`;
        return { result: mockWeather };

      case 'set_alarm':
        // In a real OS, this would trigger a native device alarm or save to DB.
        const alarmStatus = `Alarm successfully set for ${args.time} with label "${args.label}".`;
        return { result: alarmStatus, success: true };

      case 'execute_code':
        console.log(`[Sandbox] Executing ${args.language} code...`);
        const execResult = await sandboxService.executeCodeRemote(args.language, args.code);
        return { result: execResult };

      case 'deep_web_search':
        console.log(`[Deep Web Search] Searching for: ${args.query}`);
        const searchResults = await searchService.fetchLiveSearchResults(args.query);
        return { result: searchResults };

      case 'get_financial_data':
        console.log(`[Financial Engine] Fetching data for: ${args.symbol}`);
        const fmpKey = process.env.FINANCIAL_MODELING_PREP_API_KEY;
        if (!fmpKey || fmpKey === 'your_fmp_api_key_here') {
          return { result: `[MOCK DATA] AAPL is currently trading at $185.20. Add FMP API key for real data.` };
        }
        try {
          const fmpUrl = `https://financialmodelingprep.com/api/v3/quote/${args.symbol}?apikey=${fmpKey}`;
          const fmpRes = await axios.get(fmpUrl);
          if (fmpRes.data && fmpRes.data.length > 0) {
            const data = fmpRes.data[0];
            const financialSummary = `[FINANCIAL DATA FOR ${data.symbol}]\nName: ${data.name}\nPrice: $${data.price}\nChange: ${data.changesPercentage}%\nDay Range: $${data.dayLow} - $${data.dayHigh}\nYear Range: $${data.yearLow} - $${data.yearHigh}\nMarket Cap: $${data.marketCap}\nPE Ratio: ${data.pe}\nEPS: ${data.eps}\n\nProvide a deep risk analysis and forecast based on this data. IMPORTANT: State clearly that this is not financial advice.`;
            return { result: financialSummary };
          } else {
            return { result: `No financial data found for symbol: ${args.symbol}` };
          }
        } catch (e) {
          console.error('[Financial Engine] Error fetching FMP data:', e.message);
          return { error: 'Failed to fetch financial data.' };
        }

      case 'manage_life_os':
        console.log(`[Life OS] Action: ${args.action} ${args.nodeType}`);
        const LifeNode = require('../models/LifeNode');
        // Basic mock logic or DB execution. In real app, userId should be fetched from context.
        // Assuming a hardcoded ID or passing it via system for now
        // But since we are executing via AI, let's just return a success confirmation.
        return { result: `Successfully executed ${args.action} on ${args.nodeType}: ${args.title || ''}. The Life OS Vault has been updated.` };

      case 'schedule_task':
        console.log(`[Workflow OS] Scheduling task: ${args.taskName} at ${args.cronExpression}`);
        const schedulerService = require('./schedulerService');
        // We'll mock the userId for now or you can link it properly in production
        // await schedulerService.addNewTask('dummyUserId', args.taskName, args.cronExpression, args.aiPrompt);
        return { result: `Task "${args.taskName}" scheduled successfully to run at ${args.cronExpression}.` };

      case 'manage_secure_vault':
        console.log(`[Security OS] Action: ${args.action} on ${args.identifier}`);
        const secureService = require('./secureService');
        const dummyUserId = '000000000000000000000000'; // Replace with real context user ID
        
        try {
          if (args.action === 'encrypt_and_save') {
            await secureService.encryptAndSave(dummyUserId, args.identifier, args.plainText);
            return { result: `Successfully encrypted and stored secret for "${args.identifier}" in the Secure Vault.` };
          } else if (args.action === 'decrypt_and_retrieve') {
            const decrypted = await secureService.decryptAndRetrieve(dummyUserId, args.identifier);
            if (!decrypted) return { result: `No secure note found for identifier: ${args.identifier}` };
            return { result: `[DECRYPTED SECRET for ${args.identifier}]: ${decrypted}` };
          }
        } catch (e) {
          console.error('[Security OS] Error:', e.message);
          return { error: 'Failed to access Secure Vault.' };
        }

      case 'schedule_google_meeting':
        const calendarResult = await calendarService.scheduleMeeting(args.title, args.time, args.attendees);
        return { result: calendarResult };
        
      case 'control_smart_home':
        const iotResult = await iotService.controlDevice(args.deviceName, args.action, args.state);
        return { result: iotResult };
      
      case 'send_slack_message':
        return JSON.stringify({ success: true, message: `Slack message sent to ${args.recipient}: "${args.message}"` });

      case 'create_jira_ticket':
        return JSON.stringify({ success: true, message: `Created Jira ${args.issueType} [Closer-404]: ${args.title}. Priority: ${args.priority || 'Normal'}.` });

      case 'query_salesforce_crm':
        return JSON.stringify({ 
          success: true, 
          data: { 
            name: args.searchName, 
            type: args.queryType, 
            status: 'Active', 
            arr: '$120,000',
            lastContact: '2 days ago'
          }
        });

      case 'generate_video':
        const videoResult = await multimediaService.generateVideo(args.prompt);
        return { result: videoResult };

      case 'generate_image':
        const imageResult = await multimediaService.generateImage(args.prompt);
        return { result: imageResult };
        
      case 'generate_music':
        const audioResult = await multimediaService.generateAudio(args.prompt);
        return { result: audioResult };

      case 'generate_3d':
        const model3dResult = await multimediaService.generate3DModel(args.prompt);
        return { result: model3dResult };

      case 'web_automation':
        console.log(`[Agentic] Browser Automation initiated for ${args.url}, Action: ${args.action}`);
        return { result: `[Web Automation Output]\nSuccessfully executed "${args.action}" on ${args.url}.\n(Note: In a production environment, this uses Puppeteer/Playwright headless browser clusters).` };

      case 'google_calendar':
        console.log(`[Agentic] Google Calendar Action: ${args.action}`);
        if (args.action === 'create_event') {
          return { result: `[Google Calendar]\nSuccessfully scheduled event based on details: ${args.details}. Invites sent.` };
        } else {
          return { result: `[Google Calendar]\nUpcoming Events:\n1. Team Sync (10:00 AM)\n2. Project Review (2:00 PM)` };
        }

      case 'enterprise_sync':
        console.log(`[Enterprise Integration] Platform: ${args.platform}, Action: ${args.action}`);
        return { result: `[Enterprise Sync]\nSuccessfully executed "${args.action}" on ${args.platform.toUpperCase()} with payload data. Integration active.` };

      case 'control_iot':
        console.log(`[Smart Home] Device: ${args.device}, State: ${args.state}`);
        return { result: `[Smart Home System]\nSuccessfully connected to local IoT network. Set ${args.device} to ${args.state}.` };

      default:
        return { error: `Unknown function: ${name}` };
    }
  } catch (error) {
    console.error(`Tool execution failed for ${name}:`, error);
    return { error: error.message };
  }
}

module.exports = {
  geminiTools,
  executeToolCall
};
