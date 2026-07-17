const { getAgenda } = require('../config/agenda');

class QueueService {
  /**
   * Add an async task to the background queue.
   * @param {Function} taskFn - An async function representing the background task
   * @param {string} taskName - For logging purposes
   */
  async enqueue(taskFn, taskName = 'Unnamed Task') {
    // Closer-AI Fix: We cannot stringify tasks because we lose closure variables (userId, message, etc.)
    // Running asynchronously in-memory preserves lexical scope bindings.
    console.log(`[QueueService] Task '${taskName}' added to async memory queue.`);
    setImmediate(async () => {
      try {
        await taskFn();
      } catch (err) {
        console.error(`[QueueService] Error executing task '${taskName}':`, err);
      }
    });
  }
}

// Export a singleton instance
module.exports = new QueueService();
