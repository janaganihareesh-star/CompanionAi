import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { getAuthConfig } from './authSlice';

const initialState = {
  conversations: [],
  currentConversation: null,
  messages: [],
  streamingMessage: '',
  liveCodeStream: '',
  emergencyMode: false,
  page: 1,
  hasMore: true,
  isLoading: false,
  isSending: false,
  error: null
};

// THUNKS
export const createConversationAsync = createAsyncThunk(
  'chat/create',
  async (title, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const res = await axios.post('/api/chat/create', { title }, getAuthConfig(token));
      return res.data.conversation;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create conversation.');
    }
  }
);

export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const res = await axios.get('/api/chat/history', getAuthConfig(token));
      return res.data.conversations;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load conversations.');
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (conversationId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const res = await axios.get(`/api/chat/${conversationId}/messages?page=1&limit=30`, getAuthConfig(token));
      return { messages: res.data.messages, page: 1 };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load chat history.');
    }
  }
);

export const fetchMoreMessages = createAsyncThunk(
  'chat/fetchMoreMessages',
  async (conversationId, { getState, rejectWithValue }) => {
    try {
      const state = getState().chat;
      const nextPage = state.page + 1;
      const { token } = getState().auth;
      const res = await axios.get(`/api/chat/${conversationId}/messages?page=${nextPage}&limit=30`, getAuthConfig(token));
      return { messages: res.data.messages, page: nextPage };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load more messages.');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ conversationId, message, imageBase64 }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const res = await axios.post('/api/chat/send', { conversationId, message, imageBase64 }, getAuthConfig(token));
      return res.data; 
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to dispatch message.');
    }
  }
);

export const sendMessageStreamAsync = ({ conversationId, message, attachments, imageBase64 }) => async (dispatch, getState) => {
  // Dispatch pending action with a dummy requestId 'stream-req' and the args.
  // This correctly populates action.meta.arg so the optimistic UI reducer works.
  dispatch(sendMessage.pending('stream-req', { message, attachments, imageBase64 }));

  try {
    const { token } = getState().auth;
    
    // Instead of SSE fetch reader, we make an API call. 
    // The Socket.io backend listeners (in useSocket.js) will handle 'ai_stream_chunk' and 'ai_response' automatically.
    const selectedModel = getState().settings?.selectedModel || 'gemini-1.5-flash';
    const response = await axios.post('/api/chat/send-stream', {
      conversationId,
      message,
      attachments,
      imageBase64,
      model: selectedModel
    }, getAuthConfig(token));

    // Ensure we capture the conversationId if this was a new chat
    if (response.data && response.data.conversationId) {
      dispatch({ type: 'chat/streamMetadata', payload: { conversationId: response.data.conversationId } });
    }

  } catch (err) {
    console.error('Send message stream error:', err);
    dispatch(sendMessage.rejected(err.message));
    dispatch({ type: 'chat/streamError' });
  }
};

export const deleteConversation = createAsyncThunk(
  'chat/deleteConversation',
  async (conversationId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      await axios.delete(`/api/chat/${conversationId}`, getAuthConfig(token));
      return conversationId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to archive chat.');
    }
  }
);

export const editAndResendMessage = createAsyncThunk(
  'chat/editAndResendMessage',
  async ({ conversationId, messageId, newText }, { dispatch, getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      // 1. Truncate conversation from the target message onwards
      await axios.delete(`/api/chat/${conversationId}/messages-from/${messageId}`, getAuthConfig(token));
      
      // 2. Dispatch a normal send message with the new text
      // This will automatically trigger the optimistic UI and AI response logic!
      dispatch(sendMessage({ conversationId, message: newText }));
      
      return { conversationId, messageId };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to edit message.');
    }
  }
);

export const branchConversation = createAsyncThunk(
  'chat/branchConversation',
  async ({ conversationId, messageId }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const res = await axios.post(`/api/chat/${conversationId}/branch/${messageId}`, {}, getAuthConfig(token));
      return res.data.newConversationId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to branch conversation.');
    }
  }
);

export const updateConversation = createAsyncThunk(
  'chat/updateConversation',
  async ({ id, updates }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const res = await axios.patch(`/api/chat/${id}`, updates, getAuthConfig(token));
      return res.data.conversation;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update conversation.');
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setCurrentConversation(state, action) {
      state.currentConversation = action.payload;
    },
    addMessage(state, action) {
      const exists = state.messages.some(m => m._id === action.payload._id);
      if (!exists) {
        state.messages.push(action.payload);
        state.messages.sort((a, b) => new Date(a.timestamp || a.createdAt) - new Date(b.timestamp || b.createdAt));
      }
    },
    clearChat(state) {
      state.messages = [];
      state.currentConversation = null;
    },
    startStreaming(state) {
      state.isSending = true;
      state.streamingMessage = '';
    },
    streamChunk(state, action) {
      if (typeof action.payload === 'string') {
        state.streamingMessage = (state.streamingMessage || '') + action.payload;
      } else if (action.payload && action.payload.chunk) {
        state.streamingMessage = (state.streamingMessage || '') + action.payload.chunk;
      }
    },
    streamMetadata(state, action) {
      if (!state.currentConversation) {
        state.currentConversation = { _id: action.payload.conversationId };
      }
    },
    streamDone(state, action) {
      state.isSending = false;
      state.streamingMessage = '';
      state.messages = state.messages.filter(m => !m.isOptimistic);
      
      // Step 8: Redux Memory Leak Prevention (Limit to last 100 messages)
      if (state.messages.length > 100) {
        state.messages = state.messages.slice(state.messages.length - 100);
      }
      
      const { conversationId, userMessage, aiMessage } = action.payload;

      // Sort messages to ensure correct order
      state.messages.sort((a, b) => new Date(a.timestamp || a.createdAt) - new Date(b.timestamp || b.createdAt));

      let conv = state.conversations.find(c => c._id === conversationId);
      if (conv) {
        if (aiMessage) {
          conv.lastMessage = aiMessage.content;
          conv.lastMessageAt = aiMessage.timestamp || aiMessage.createdAt;
        }
      } else {
        if (userMessage && aiMessage) {
          let text = userMessage.content;
          state.conversations.unshift({
            _id: conversationId,
            title: typeof text === 'string' ? text.substring(0, 30) + '...' : 'New Chat',
            lastMessage: aiMessage.content,
            lastMessageAt: aiMessage.timestamp || aiMessage.createdAt,
            isPinned: false,
            isArchived: false
          });
          state.currentConversation = state.conversations[0];
        }
      }
    },
    streamError(state) {
      state.isSending = false;
      state.streamingMessage = '';
      const optMsg = state.messages.find(m => m.isOptimistic);
      if (optMsg) {
        optMsg.isError = true;
        optMsg.isOptimistic = false;
      }
    },
    stopGeneration(state) {
      state.isSending = false;
      if (state.streamingMessage) {
        state.streamingMessage += ' [Stopped by User]';
        // Add current streaming text as a real message
        if (state.currentConversation) {
          state.messages.push({
            _id: `temp-${Date.now()}`,
            sender: 'ai',
            content: state.streamingMessage,
            conversationId: state.currentConversation._id,
            timestamp: new Date().toISOString()
          });
        }
      }
      state.streamingMessage = '';
    },
    setEmergencyMode(state, action) {
      state.emergencyMode = action.payload;
    },
    liveCodeChunk(state, action) {
      state.liveCodeStream += action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Conversations
      .addCase(fetchConversations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Create Conversation
      .addCase(createConversationAsync.fulfilled, (state, action) => {
        state.conversations.unshift(action.payload);
        state.currentConversation = action.payload;
        state.messages = [];
      })

      // Fetch Messages
      .addCase(fetchMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.messages = [];
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload.messages.slice(-100); // Enforce memory cap
        state.page = action.payload.page;
        state.hasMore = action.payload.messages.length === 30;
        state.page = action.payload.page;
        state.hasMore = action.payload.messages.length === 30;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch More Messages
      .addCase(fetchMoreMessages.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMoreMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        // Prepend older messages
        state.messages = [...action.payload.messages, ...state.messages];
        state.page = action.payload.page;
        state.hasMore = action.payload.messages.length === 30;
      })
      .addCase(fetchMoreMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Send Message
      .addCase(sendMessage.pending, (state, action) => {
        state.isSending = true;
        state.error = null;
        // Optimistic UI: Immediately show the user's message
        if (action.meta && action.meta.arg && (action.meta.arg.message || action.meta.arg.attachments)) {
          state.messages.push({
            _id: 'temp_' + Date.now(),
            sender: 'user',
            content: action.meta.arg.message || '',
            imageBase64: action.meta.arg.imageBase64,
            attachments: action.meta.arg.attachments || [],
            timestamp: new Date().toISOString(),
            isOptimistic: true
          });
        }
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isSending = false;
        // Remove the temporary optimistic message before adding the real ones from DB
        state.messages = state.messages.filter(m => !m.isOptimistic);
        
        // Append user and AI replies if they are not already cached
        const hasUserMsg = state.messages.some(m => m._id === action.payload.userMessage._id);
        if (!hasUserMsg) {
          state.messages.push(action.payload.userMessage);
        }
        const hasAiMsg = state.messages.some(m => m._id === action.payload.aiMessage._id);
        if (!hasAiMsg) {
          state.messages.push(action.payload.aiMessage);
        }
        
        // Ensure chronological order
        state.messages.sort((a, b) => new Date(a.timestamp || a.createdAt) - new Date(b.timestamp || b.createdAt));

        // Update list properties for target conversation
        const conv = state.conversations.find(c => c._id === action.payload.conversationId);
        if (conv) {
          conv.lastMessage = action.payload.aiMessage.content;
          conv.lastMessageAt = action.payload.aiMessage.timestamp;
        } else {
          // If it's a new conversation, it won't be in state.conversations yet.
          // Add a dummy conversation so it appears immediately before fetchConversations completes.
          state.conversations.unshift({
            _id: action.payload.conversationId,
            title: action.payload.userMessage.content.substring(0, 30) + '...',
            lastMessage: action.payload.aiMessage.content,
            lastMessageAt: action.payload.aiMessage.timestamp,
            isPinned: false,
            isArchived: false
          });
        }

        // Fix for "New Chat": Transition seamlessly to the newly created conversation
        if (!state.currentConversation && action.payload.conversationId) {
          state.currentConversation = state.conversations.find(c => c._id === action.payload.conversationId);
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isSending = false;
        state.error = action.payload;
        // If message failed, mark the optimistic message as error so user doesn't lose text
        const optMsg = state.messages.find(m => m.isOptimistic);
        if (optMsg) {
          optMsg.isError = true;
          optMsg.isOptimistic = false;
        }
      })

      // Delete Conversation
      .addCase(deleteConversation.fulfilled, (state, action) => {
        state.conversations = state.conversations.filter(c => c._id !== action.payload);
        if (state.currentConversation?._id === action.payload) {
          state.currentConversation = null;
          state.messages = [];
        }
      })
      
      // Edit and Resend Message
      .addCase(editAndResendMessage.fulfilled, (state, action) => {
        const { messageId } = action.payload;
        const targetIndex = state.messages.findIndex(m => m._id === messageId);
        if (targetIndex !== -1) {
          state.messages = state.messages.slice(0, targetIndex);
        }
      })
      
      // Update Conversation (Pin/Archive/Rename)
      .addCase(updateConversation.fulfilled, (state, action) => {
        const updatedConv = action.payload;
        const index = state.conversations.findIndex(c => c._id === updatedConv._id);
        if (index !== -1) {
          state.conversations[index] = { ...state.conversations[index], ...updatedConv };
        }
        if (state.currentConversation?._id === updatedConv._id) {
          state.currentConversation = { ...state.currentConversation, ...updatedConv };
        }
      })
      
      // Branch Conversation
      .addCase(branchConversation.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(branchConversation.fulfilled, (state) => {
        state.isLoading = false;
        // The UI will handle opening the new tab, but we can clear loading
      })
      .addCase(branchConversation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
      

  }
});

export const { 
  setCurrentConversation, 
  addMessage, 
  clearChat,
  startStreaming,
  streamChunk,
  streamMetadata,
  streamDone,
  streamError,
  stopGeneration,
  setEmergencyMode,
  liveCodeChunk
} = chatSlice.actions;
export default chatSlice.reducer;