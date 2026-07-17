import api from './api';

export const syncCRDTData = async () => {
  const token = localStorage.getItem('closer-token');
  if (!token) return;

  try {
    // 1. Fetch pending local offline operations from IndexedDB/localStorage
    const offlineOpsRaw = localStorage.getItem('crdt_offline_queue');
    let offlineOps = [];
    if (offlineOpsRaw) {
      offlineOps = JSON.parse(offlineOpsRaw);
    }

    if (offlineOps.length === 0) {
      console.log('✅ No offline CRDT operations to sync.');
      return;
    }

    console.log(`🔄 Syncing ${offlineOps.length} offline operations to cloud...`);

    // 2. Post to backend CRDT sync endpoint using the configured api instance
    const response = await api.post('/api/sync', { operations: offlineOps });

    if (response.status === 200) {
      // 3. Clear local queue on success
      localStorage.removeItem('crdt_offline_queue');
      console.log('✅ CRDT Sync complete and queue cleared.');
    }
  } catch (error) {
    console.error('❌ CRDT Sync Engine Error:', error);
  }
};

export const queueOfflineOp = (operation) => {
  const offlineOpsRaw = localStorage.getItem('crdt_offline_queue');
  let offlineOps = [];
  if (offlineOpsRaw) {
    offlineOps = JSON.parse(offlineOpsRaw);
  }
  offlineOps.push({ ...operation, timestamp: Date.now() });
  localStorage.setItem('crdt_offline_queue', JSON.stringify(offlineOps));
};
