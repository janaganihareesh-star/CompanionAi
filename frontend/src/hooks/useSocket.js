import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { addMessage } from '../store/chatSlice';
import { addNotification } from '../store/notificationSlice';

export default function useSocket() {
  const dispatch = useDispatch();
  const socketRef = useRef(null);
  const { user, token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!token || !user) return;

    // Connect to Socket server (Vite proxy redirects to port 6999 locally)
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:6999';
    socketRef.current = io(backendUrl, {
      auth: { token },
      query: { token }
    });

    socketRef.current.on('connect', () => {
      console.log('Socket.IO connected successfully:', socketRef.current.id);
      socketRef.current.emit('join', user.id);
    });

    // Real-time AI chat reply incoming handler
    socketRef.current.on('ai_response', (payload) => {
      if (payload && payload.userMessage) {
        dispatch(addMessage(payload.userMessage));
      }
      if (payload && payload.aiMessage) {
        dispatch(addMessage(payload.aiMessage));
      }
    });

    // Real-time Push Notification handler
    socketRef.current.on('notification', (notification) => {
      if (notification) {
        dispatch(addNotification(notification));
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [token, user, dispatch]);

  useEffect(() => {
    const handler = (event) => {
      if (event.reason?.message?.includes('message channel closed')) {
        event.preventDefault();
      }
    };
    window.addEventListener('unhandledrejection', handler);
    return () => window.removeEventListener('unhandledrejection', handler);
  }, []);

  const emitTyping = (conversationId, recipientId, typingStatus) => {
    if (socketRef.current) {
      socketRef.current.emit('typing', {
        conversationId,
        recipientId,
        typing: typingStatus
      });
    }
  };

  return {
    socket: socketRef.current,
    emitTyping
  };
}