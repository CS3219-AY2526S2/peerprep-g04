import { useState } from "react";
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: "YOUR_API_KEY" });

export function useAiChat() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');

  return {
    messages,
    message,
    setMessage,
  }
}