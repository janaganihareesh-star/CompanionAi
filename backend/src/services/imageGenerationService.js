/**
 * Image Generation Service
 * Uses Pollinations.ai (Free, no API key required text-to-image)
 * to provide image generation capabilities to Closer-AI.
 */
class ImageGenerationService {
    constructor() {
        this.baseUrl = 'https://image.pollinations.ai/prompt/';
    }

    /**
     * Generate an image from text prompt
     * @param {string} prompt - The description of the image
     * @param {object} options - Width, height, seed
     * @returns {string} - URL of the generated image
     */
    async generateImage(prompt, options = {}) {
        try {
            const width = options.width || 1024;
            const height = options.height || 1024;
            const seed = options.seed || Math.floor(Math.random() * 1000000);
            
            // Encode the prompt for the URL
            const encodedPrompt = encodeURIComponent(prompt);
            
            // Pollinations returns the image directly via this URL structure
            const imageUrl = `${this.baseUrl}${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true`;
            
            return {
                success: true,
                url: imageUrl,
                prompt,
                metadata: { width, height, seed }
            };
        } catch (error) {
            console.error('Image generation failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = new ImageGenerationService();
