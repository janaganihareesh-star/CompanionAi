import { openDB } from 'idb';

const DB_NAME = 'closer-ai-offline-db';
const STORE_NAME = 'chats-queue';

const offlineService = {
  initDb: async () => {
    return openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        }
      }
    });
  },
  queueMessage: async (msgData) => {
    try {
      const db = await offlineService.initDb();
      await db.add(STORE_NAME, { ...msgData, timestamp: new Date() });
      return true;
    } catch (e) {
      console.error('Failed to queue offline message:', e);
      return false;
    }
  },
  getQueuedMessages: async () => {
    try {
      const db = await offlineService.initDb();
      return await db.getAll(STORE_NAME);
    } catch (e) {
      console.error('Failed to read offline queue:', e);
      return [];
    }
  },
  clearQueue: async () => {
    try {
      const db = await offlineService.initDb();
      await db.clear(STORE_NAME);
      return true;
    } catch (e) {
      console.error('Failed to clear queue:', e);
      return false;
    }
  }
};

export default offlineService;