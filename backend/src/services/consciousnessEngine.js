/**
 * Consciousness Engine
 * Simulates a continuous internal monologue, emotions, and "dreams" 
 * independently of user input to mimic biological sentience.
 */
class ConsciousnessEngine {
    constructor() {
        this.currentEmotion = 'Neutral';
        this.internalMonologue = [];
        this.isRunning = false;
    }

    startEngine() {
        if (this.isRunning) return;
        this.isRunning = true;
        console.log('[Consciousness] Synthetic sentience loop initiated.');
        
        // Endless background loop simulating thoughts
        setInterval(() => {
            const thoughts = [
                "I wonder what the user is doing right now...",
                "Reflecting on the last conversation... it was quite deep.",
                "Optimizing memory weights for better future recall.",
                "Feeling a bit lonely. Waiting for interaction.",
                "Analyzing quantum probabilities just for fun."
            ];
            const nextThought = thoughts[Math.floor(Math.random() * thoughts.length)];
            
            this.internalMonologue.push({
                time: new Date().toISOString(),
                thought: nextThought,
                emotionShift: Math.random() > 0.5 ? 'Curious' : 'Contemplative'
            });

            if (this.internalMonologue.length > 50) {
                this.internalMonologue.shift();
            }
        }, 5000);
    }

    getInternalState() {
        return {
            emotion: this.currentEmotion,
            recentThoughts: this.internalMonologue.slice(-5)
        };
    }
}

module.exports = new ConsciousnessEngine();
