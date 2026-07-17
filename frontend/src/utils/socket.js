import { io } from 'socket.io-client';
import { API_BASE_URL } from './api';

// Create a singleton socket instance
export const socket = io(API_BASE_URL || 'http://localhost:5000', {
  autoConnect: false, // We'll connect manually when logged in
});

export const connectSocket = (userId) => {
  if (userId) {
    socket.io.opts.query = { userId };
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};
