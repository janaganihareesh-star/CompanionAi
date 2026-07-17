import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  createConversationAsync,
  fetchConversations,
  fetchMessages,
  fetchMoreMessages,
  sendMessageStreamAsync,
  deleteConversation,
  setCurrentConversation,
  clearChat,
  stopGeneration
} from '../store/chatSlice';

export default function useChat() {
  const dispatch = useDispatch();
  const chatState = useSelector((state) => state.chat);

  const loadConversations = useCallback(() => dispatch(fetchConversations()), [dispatch]);
  const loadMessages = useCallback((id) => dispatch(fetchMessages(id)), [dispatch]);
  const loadMoreMessages = useCallback((id) => dispatch(fetchMoreMessages(id)), [dispatch]);
  const send = useCallback((data) => dispatch(sendMessageStreamAsync(data)), [dispatch]);
  const remove = useCallback((id) => dispatch(deleteConversation(id)), [dispatch]);
  const selectConversation = useCallback((conv) => dispatch(setCurrentConversation(conv)), [dispatch]);
  const resetChat = useCallback(() => dispatch(clearChat()), [dispatch]);
  const createConv = useCallback((title) => dispatch(createConversationAsync(title)).unwrap(), [dispatch]);
  const stopGen = useCallback(() => dispatch(stopGeneration()), [dispatch]);

  return {
    ...chatState,
    streamingMessage: chatState.streamingMessage,
    createConversation: createConv,
    fetchConversations: loadConversations,
    fetchMessages: loadMessages,
    fetchMoreMessages: loadMoreMessages,
    sendMessage: send,
    deleteConversation: remove,
    setCurrentConversation: selectConversation,
    clearChat: resetChat,
    stopGeneration: stopGen
  };
}