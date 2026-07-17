const WebSocket = require('ws');
const { setupWSConnection } = require('y-websocket/bin/utils');

const PORT = 1234; // Dedicated port for Collaborative Editing (Yjs)

console.log('🚀 Starting Closer-AI Native Yjs WebSocket Server...');

try {
  const wss = new WebSocket.Server({ port: PORT });
  
  wss.on('error', (err) => {
    console.error('❌ Yjs WebSocket Server error:', err.message);
  });
  
  wss.on('connection', (conn, req) => {
    setupWSConnection(conn, req, { gc: true });
  });
  
  console.log(`🔗 Yjs Native WebSocket Server running independently on port ${PORT}`);
} catch (e) {
  console.error('❌ Failed to start Yjs server. Ensure y-websocket is installed.', e);
  process.exit(1);
}
