/**
 * Fact Checker Agent
 * Mitigates hallucinations by verifying claims against external sources (e.g. Wikipedia/Google).
 */
const axios = require('axios');

class FactCheckerAgent {
    async verify(claim, aiResponse) {
        console.log(`[FactChecker] Verifying claim: ${claim}`);
        
        // Mock verification logic
        let isVerified = true;
        let sources = [];

        // Simulated check
        if (aiResponse.includes('made up fact')) {
            isVerified = false;
        } else {
            sources = ['https://wikipedia.org/wiki/True_Fact'];
        }

        return {
            verified: isVerified,
            originalResponse: aiResponse,
            correctedResponse: isVerified ? aiResponse : 'I apologize, but I could not verify that information. ' + aiResponse,
            sources
        };
    }
}

module.exports = new FactCheckerAgent();
