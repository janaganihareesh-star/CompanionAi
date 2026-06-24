import { useSelector, useDispatch } from 'react-redux';
import {
  createConversationAsync,
  fetchConversations,
  fetchMessages,
  sendMessageStreamAsync,
  deleteConversation,
  setCurrentConversation,
  clearChat
} from '../store/chatSlice';

export default function useChat() {
  const dispatch = useDispatch();
  const chatState = useSelector((state) => state.chat);

  const loadConversations = () => dispatch(fetchConversations());
  const loadMessages = (id) => dispatch(fetchMessages(id));
  const send = (data) => dispatch(sendMessageStreamAsync(data));
  const remove = (id) => dispatch(deleteConversation(id));
  const selectConversation = (conv) => dispatch(setCurrentConversation(conv));
  const resetChat = () => dispatch(clearChat());
  const createConv = (title) => dispatch(createConversationAsync(title)).unwrap();

  return {
    ...chatState,
    streamingMessage: chatState.streamingMessage,
    createConversation: createConv,
    fetchConversations: loadConversations,
    fetchMessages: loadMessages,
    sendMessage: send,
    deleteConversation: remove,
    setCurrentConversation: selectConversation,
    clearChat: resetChat
  };
}