import { useState } from "react";
import { GoogleGenAI } from '@google/genai';
import { toast } from "react-toastify";

export const sides = Object.freeze({ ai: 'ai', user: 'user' });

export function useAiChat() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    setLoading(true);
      setMessages(messages => [...messages, { side: sides.user, text: message }]);
      setMessage('');
      const contextString =
        `
        Given the current responses between you, the ai and the user, generate a response.
        Do not include any formatting, just give the response.
        The stringified JSON of messages is provided below.
        It can be that the current context is empty, if so the json string is empty.
        ${JSON.stringify([...messages, { side: sides.user, text: message }])}
        `;

      try {
        const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_AI_API_KEY });
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: contextString,
        });

        const text = response.text;
        setMessages(messages => [...messages, { side: sides.ai, text }]);
      } catch (err) {
        toast(err?.message);
      }
     
    setLoading(false);
  }

  function clearMessages() {
    setMessages([]);
  }

  return {
    messages,
    message,
    setMessage,
    loading,
    sendMessage,
    clearMessages,
  }
}