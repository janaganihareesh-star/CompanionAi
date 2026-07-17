const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  const connUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/closer-ai';
  let retries = 5;
  while (retries > 0) {
    try {
      const conn = await mongoose.connect(connUri, {
        autoIndex: true,
        maxPoolSize: 50, // Maintain up to 50 socket connections
        minPoolSize: 10, // Keep at least 10 connections active
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        family: 4 // Use IPv4, skip trying IPv6
      });
      console.log('MongoDB Connected successfully with pooling.');
      
      mongoose.connection.on('disconnected', () => {
        console.warn('[MongoDB] Disconnected! Attempting to reconnect...');
      });
      
      mongoose.connection.on('reconnected', () => {
        console.log('[MongoDB] Successfully reconnected to the database!');
      });

      mongoose.connection.on('error', (err) => {
        console.error('[MongoDB] Connection error:', err);
      });

      
      // Drop unique index on mobileNumber if it exists to resolve duplication issues
      try {
        await conn.connection.db.collection('users').dropIndex('mobileNumber_1');
        console.log('Successfully dropped unique index mobileNumber_1 from users collection');
      } catch (indexErr) {
        // Index might not exist or already dropped, ignore error safely
      }
      
      break;
    } catch (err) {
      logger.error(`Database connection failed: ${err.message}`);
      retries -= 1;
      logger.info(`Retries left: ${retries}. Reconnecting in 5 seconds...`);
      if (retries === 0) {
        logger.error('Could not connect to MongoDB. Exiting application.');
        process.exit(1);
      }
      await new Promise(res => setTimeout(res, 5000));
    }
  }
};

module.exports = connectDB;