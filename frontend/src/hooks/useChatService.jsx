import { useRef } from "react";
import { useState, useEffect } from "react";
import { io } from 'socket.io-client';

export function useChatService(user, roomId, token) {
  const [messages, setMessages] = useState([]);
  const chatSocketRef = useRef();


  useEffect(() => {
    if (!user?.username || !roomId) return;
    
    chatSocketRef.current = io(`http://${import.meta.env.VITE_CHAT_SERVICE_API}`, { auth: { token }});

    chatSocketRef.current.on('join room', (messages) => {
      setMessages(messages);
    });

    chatSocketRef.current.on('new message', (message) => {
      setMessages(msgs => [...msgs, message]);
    });

    chatSocketRef.current.emit('join room', user.username, roomId);

    return () => chatSocketRef.current.disconnect();

  }, [user?.username, roomId, token]);

  function sendMessage(message) {
    chatSocketRef.current?.emit('new message', user.username, message);
  }

  function leave() {
    chatSocketRef.current?.emit('leave', user.username);
  }

  return {
    messages,
    sendMessage,
    leave,
  }
}