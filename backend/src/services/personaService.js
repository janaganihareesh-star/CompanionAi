/**
 * Persona Service
 * Manages the creation, retrieval, and interaction with Custom Personas (like Character.ai)
 */
const Persona = require('../models/Persona');

class PersonaService {
    async createPersona(data) {
        try {
            const newPersona = new Persona(data);
            await newPersona.save();
            return { success: true, persona: newPersona };
        } catch (error) {
            console.error('[PersonaService] Error creating persona:', error);
            return { success: false, error: error.message };
        }
    }

    async getMarketplacePersonas(limit = 20) {
        try {
            // Fetch public personas sorted by popularity
            const personas = await Persona.find({ isPublic: true })
                                          .sort({ interactions: -1 })
                                          .limit(limit);
            return { success: true, personas };
        } catch (error) {
            console.error('[PersonaService] Error fetching marketplace:', error);
            return { success: false, error: error.message };
        }
    }

    async interactWithPersona(personaId, userId, message) {
        try {
            const persona = await Persona.findById(personaId);
            if (!persona) throw new Error('Persona not found');

            // Increment interactions
            persona.interactions += 1;
            await persona.save();

            // Here we would route the systemPrompt + message to the LLM
            console.log(`[PersonaService] Routing to LLM with Persona: ${persona.name}`);
            
            // Mock LLM Response for now
            const mockResponse = `[${persona.name}]: I received your message: "${message}". My system prompt guides my response!`;

            return { success: true, response: mockResponse };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

module.exports = new PersonaService();
