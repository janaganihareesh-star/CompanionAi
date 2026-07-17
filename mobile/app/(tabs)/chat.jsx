import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { GiftedChat, Bubble, Send } from 'react-native-gifted-chat';
import { useSelector } from 'react-redux';
import axios from 'axios';
import io from 'socket.io-client';

const API_URL = 'http://localhost:6999/api';
const SOCKET_URL = 'http://localhost:6999';

export default function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const { user, token } = useSelector(state => state.auth);
  const [socket, setSocket] = useState(null);
  const [conversationId, setConversationId] = useState(null);

  useEffect(() => {
    if (!token) return;

    // Connect socket
    const newSocket = io(SOCKET_URL, {
      auth: { token }
    });
    setSocket(newSocket);

    newSocket.on('ai_response', (data) => {
      if (data.aiMessage) {
        const newMsg = {
          _id: data.aiMessage._id || Math.random().toString(),
          text: data.aiMessage.content,
          createdAt: new Date(data.aiMessage.timestamp || Date.now()),
          user: {
            _id: 2,
            name: 'CloserAI',
            avatar: 'https://placekitten.com/200/200', // placeholder
          },
        };
        setMessages(previousMessages => GiftedChat.append(previousMessages, [newMsg]));
      }
    });

    return () => newSocket.disconnect();
  }, [token]);

  const onSend = useCallback((newMessages = []) => {
    setMessages(previousMessages => GiftedChat.append(previousMessages, newMessages));
    const text = newMessages[0].text;
    
    // Send to backend
    axios.post(`${API_URL}/chat/send`, { message: text, conversationId }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      if (!conversationId && res.data.conversationId) {
        setConversationId(res.data.conversationId);
      }
    }).catch(err => {
      console.error('Failed to send message', err);
    });
  }, [conversationId, token]);

  const renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: '#06b6d4',
          },
          left: {
            backgroundColor: '#1e293b',
          }
        }}
        textStyle={{
          right: { color: '#0f172a' },
          left: { color: '#f8fafc' }
        }}
      />
    );
  };

  return (
    <View style={styles.container}>
      <GiftedChat
        messages={messages}
        onSend={messages => onSend(messages)}
        user={{
          _id: 1, // User
        }}
        renderBubble={renderBubble}
        placeholder="Message CloserAI..."
        alwaysShowSend
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  }
});
