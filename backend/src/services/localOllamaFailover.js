const axios = require('axios');

class LocalOllamaFailoverService {
  constructor() {
    this.localOllamaUrl = 'http://localhost:11434/api/generate';
    this.defaultModel = 'llama3'; // Requires the user to have pulled 'llama3' locally
  }

  async generateFallbackResponse(prompt, systemPrompt = '') {
    try {
      console.log(`[Failover] OpenAI/Anthropic APIs are down or unreachable. Routing to Local Ollama (${this.defaultModel})...`);
      
      const response = await axios.post(this.localOllamaUrl, {
        model: this.defaultModel,
        prompt: `${systemPrompt}\n\nUser: ${prompt}\nAI:`,
        stream: false
      }, { timeout: 15000 }); // 15 sec timeout for local inference

      if (response.data && response.data.response) {
        console.log('[Failover] Successfully generated response from local model.');
        return response.data.response;
      }
      throw new Error("Invalid response format from Ollama");
    } catch (err) {
      console.error('[Failover] Local Ollama failover also failed. Is Ollama running?', err.message);
      return "I'm currently experiencing a total cognitive blackout. My cloud systems are down and my local fallback engine is unreachable. Please try again later.";
    }
  }
}

module.exports = new LocalOllamaFailoverService();
