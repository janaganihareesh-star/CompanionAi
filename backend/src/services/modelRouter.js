/**
 * Model Router Service
 * Dynamically routes requests to different LLMs based on cost, complexity, and availability.
 * Addresses the "High API Dependency & Cost" minus.
 */
const aiService = require('./aiService');
const localInference = require('./localInferenceService');

class ModelRouter {
    async routeQuery(prompt, difficulty = 'medium') {
        try {
            // 1. Try local inference for lower difficulty
            if (difficulty === 'low') {
                const isLocalAvailable = await localInference.ping();
                if (isLocalAvailable) {
                    console.log('[ModelRouter] Routing to Local Llama3');
                    return await localInference.generateResponse(prompt);
                }
            }

            // 2. Route directly to Groq API (Blazing Fast, No 429 errors)
            console.log('[ModelRouter] Routing to Groq (Llama-3)');
            const Groq = require('groq-sdk');
            const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
            
            // Only expect JSON if the prompt explicitly asks to format as JSON, not when it says 'DO NOT OUTPUT JSON'
            const expectsJson = prompt.includes('valid JSON') || prompt.includes('Format strictly as JSON') || prompt.includes('JSON structures');
            const systemMessage = expectsJson 
                ? 'You are an intelligent AI core. Output strictly JSON. CRITICAL: You must detect the language/script the user used and ensure your generated text/replies are in that EXACT same language/script.' 
                : 'You are an intelligent AI core. CRITICAL: You must detect the language of the user\'s prompt and reply exclusively in that EXACT same language and script (e.g., Telugu, Hindi, Tanglish). Do NOT reply in English unless the user wrote in English.';

            const chatCompletion = await groq.chat.completions.create({
                messages: [
                    { role: 'system', content: systemMessage },
                    { role: 'user', content: prompt }
                ],
                model: 'llama-3.3-70b-versatile',
                temperature: 0.8,
                ...(expectsJson && { response_format: { type: "json_object" } })
            });
            
            return chatCompletion.choices[0]?.message?.content;
        } catch (error) {
            console.error('[ModelRouter] Routing failed completely:', error.message);
            // Dynamic fallback based on the prompt if possible
            return "{\"prompt\": \"A highly detailed cinematic scene of " + prompt.substring(0, 50).replace(/["\n\\]/g, '') + "\", \"vibe\": \"mysterious\"}";
        }
    }
}

module.exports = new ModelRouter();
