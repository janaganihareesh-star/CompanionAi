import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { addMessage, setEmergencyMode } from '../store/chatSlice';
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

    socketRef.current.io.on('reconnect', () => {
      console.log('Socket.IO reconnected! Recovering stream state...');
      const activeId = localStorage.getItem('activeConversationId');
      if (activeId) {
        // Fetch the latest messages to fill in any gaps caused by dropped connection
        import('../store/chatSlice').then(slice => {
          dispatch(slice.fetchMessages(activeId));
        });
      }
    });

    // Real-time AI chat reply incoming handler (Final Payload)
    socketRef.current.on('ai_response', (payload) => {
      if (window.isCRDTSyncing) {
        console.warn('CRDT Sync in progress. Dropping overlapping socket payload to prevent race conditions.');
        return;
      }
      // Dispatched once the stream finishes and the final msg is saved to DB
      if (payload && payload.userMessage) {
        dispatch(addMessage(payload.userMessage));
      }
      if (payload && payload.aiMessage) {
        dispatch(addMessage(payload.aiMessage));
        // We dispatch streamDone so that the UI can clean up the temporary streaming message
        dispatch({ 
          type: 'chat/streamDone', 
          payload: { 
            text: payload.aiMessage.content,
            messageId: payload.aiMessage._id,
            userMessageId: payload.userMessage?._id,
            conversationId: payload.conversationId,
            mood: payload.mood,
            userMessage: payload.userMessage?.content
          } 
        });
      }
      if (payload && payload.emergency) {
        dispatch(setEmergencyMode(true));
      }
    });

    // Handle Streaming Events from Socket.IO
    socketRef.current.on('ai_stream_start', (payload) => {
      dispatch({ type: 'chat/startStreaming' });
      if (payload?.conversationId) {
        dispatch({ type: 'chat/streamMetadata', payload });
      }
    });

    socketRef.current.on('agent:live_code', (payload) => {
      if (payload && payload.chunk) {
        dispatch({ type: 'chat/liveCodeChunk', payload: payload.chunk });
      }
    });

    socketRef.current.on('ai_stream_chunk', (payload) => {
      if (window.isCRDTSyncing) return;
      if (payload && payload.chunk) {
        dispatch({ type: 'chat/streamChunk', payload: payload.chunk });
      }
    });

    socketRef.current.on('ai_stream_error', () => {
      dispatch({ type: 'chat/streamError' });
    });

    // Real-time Push Notification handler
    socketRef.current.on('notification', (notification) => {
      if (notification) {
        dispatch(addNotification(notification));
      }
    });

    socketRef.current.on('live_audio_chunk', (payload) => {
      if (payload && payload.audioUrl) {
        if (!window.audioQueue) window.audioQueue = [];
        window.audioQueue.push(payload.audioUrl);
        
        if (window.playNextAudio) {
           window.playNextAudio();
        }
      }
    });

    socketRef.current.on('clear_audio_queue', () => {
      window.audioQueue = [];
      if (window.currentAudioElement) {
        window.currentAudioElement.pause();
        window.currentAudioElement.src = '';
        window.isAudioPlaying = false;
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