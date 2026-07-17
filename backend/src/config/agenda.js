const { Agenda } = require('agenda');
const { MongoBackend } = require('@agendajs/mongo-backend');
const mongoose = require('mongoose');

let agenda = null;

const initAgenda = async () => {
  if (agenda) return agenda;

  const connUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/closer-ai';

  // Agenda 6.x requires an explicit backend instance
  agenda = new Agenda({ 
    backend: new MongoBackend({ 
      address: connUri, 
      collection: 'agendaJobs' 
    }) 
  });

  // Define the dynamic task execution queue
  agenda.define('executeQueueTask', async (job) => {
    const { functionString, taskName } = job.attrs.data;
    try {
      if (functionString) {
        // Evaluate the stringified function (used for legacy queueService compatibility)
        // Note: For production at scale, it's better to register distinct jobs instead of passing functions.
        const func = eval('(' + functionString + ')');
        await func();
      }
    } catch (err) {
      console.error(`[Agenda] Failed to execute task ${taskName}:`, err);
    }
  });

  await agenda.start();
  console.log('[Agenda] Started successfully');
  
  return agenda;
};

const getAgenda = () => agenda;

module.exports = { initAgenda, getAgenda };
