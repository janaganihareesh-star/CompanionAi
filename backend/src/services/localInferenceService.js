/**
 * Local Inference Service (Offline Mode Support)
 * When internet is down or Gemini API fails, this service redirects
 * prompt queries to a local Ollama instance running on the machine (e.g. llama3).
 */
const axios = require('axios');

class LocalInferenceService {
    constructor() {
        this.ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';
        this.defaultModel = 'llama3';
        this.isAvailable = false;
    }

    /**
     * Check if local Ollama server is running
     */
    async ping() {
        try {
            const response = await axios.get('http://localhost:11434/');
            if (response.status === 200) {
                this.isAvailable = true;
                return true;
            }
        } catch (error) {
            this.isAvailable = false;
            return false;
        }
        return false;
    }

    /**
     * Generate response using local model
     */
    async generateResponse(prompt, systemInstruction) {
        if (!this.isAvailable) {
            await this.ping();
            if (!this.isAvailable) {
                throw new Error("Local Inference Engine (Ollama) is not running. Please start Ollama.");
            }
        }

        try {
            const response = await axios.post(this.ollamaUrl, {
                model: this.defaultModel,
                prompt: `${systemInstruction ? 'System: ' + systemInstruction + '\n\n' : ''}User: ${prompt}\nAI:`,
                stream: false
            });

            return response.data.response;
        } catch (error) {
            console.error('Local Inference failed:', error);
            throw new Error('Local Inference failed: ' + error.message);
        }
    }
}

module.exports = new LocalInferenceService();
