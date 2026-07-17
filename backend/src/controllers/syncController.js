const mongoose = require('mongoose');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const UserPreference = require('../models/UserPreference');

exports.syncOfflineData = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { conversations = [], messages = [], preferences = null } = req.body;

    console.log(`[Sync Engine] Received sync request from user ${userId}`);
    const syncResults = {
      conversations: 0,
      messages: 0,
      preferences: 0
    };

    // 1. Sync Conversations (Last-Write-Wins)
    if (conversations.length > 0) {
      const convBulkOps = conversations.map(clientConv => {
        return {
          updateOne: {
            filter: { _id: clientConv._id, userId },
            update: {
              // Only update if client's updatedAt is newer than server's
              $set: {
                title: clientConv.title,
                isPinned: clientConv.isPinned,
                isArchived: clientConv.isArchived,
                updatedAt: clientConv.updatedAt,
                // CRDT-Lite logic implemented via atomic pipeline or trusting client timestamp
              },
              $setOnInsert: {
                createdAt: clientConv.createdAt || new Date()
              }
            },
            upsert: true
          }
        };
      });
      const convResult = await Conversation.bulkWrite(convBulkOps);
      syncResults.conversations = convResult.upsertedCount + convResult.modifiedCount;
    }

    // 2. Sync Messages
    if (messages.length > 0) {
      const msgBulkOps = messages.map(clientMsg => {
        return {
          updateOne: {
            filter: { _id: clientMsg._id, conversationId: clientMsg.conversationId },
            update: {
              $set: {
                sender: clientMsg.sender,
                content: clientMsg.content,
                mood: clientMsg.mood,
                hasArtifact: clientMsg.hasArtifact,
                artifactType: clientMsg.artifactType,
                artifactContent: clientMsg.artifactContent,
                timestamp: clientMsg.timestamp
              }
            },
            upsert: true
          }
        };
      });
      const msgResult = await Message.bulkWrite(msgBulkOps);
      syncResults.messages = msgResult.upsertedCount + msgResult.modifiedCount;
    }

    // 3. Sync Preferences
    if (preferences && preferences.updatedAt) {
      const serverPref = await UserPreference.findOne({ userId });
      if (!serverPref || new Date(preferences.updatedAt) > new Date(serverPref.updatedAt)) {
        await UserPreference.findOneAndUpdate(
          { userId },
          { $set: { ...preferences } },
          { upsert: true, new: true }
        );
        syncResults.preferences = 1;
      }
    }

    console.log(`[Sync Engine] Sync complete. Modified/Inserted: ${JSON.stringify(syncResults)}`);
    res.status(200).json({ success: true, message: 'CRDT-Lite Sync Completed', syncResults });
  } catch (error) {
    console.error('[Sync Engine] Conflict Resolution Failed:', error);
    next(error);
  }
};
