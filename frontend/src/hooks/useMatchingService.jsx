import axios from "axios";
import { UserContext } from "./useUserService";
import { useContext, useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";

export const states = Object.freeze({
    invalid: 'invalid',
    register: 'register',
    matching: 'matching',
    matched: 'matched',
});

const matching_api = axios.create({
  baseURL: `http://${import.meta.env.VITE_MATCHING_SERVICE_API}`,
  headers: {
    'Content-Type': 'application/json',
  }
})

export function useMatchingService() {
  const { user, accessToken } = useContext(UserContext);
  const { user_id, username } = user || {};
  const [state, setState] = useState(null);
  const [stateData, setStateData] = useState(null);
  const socketRef = useRef();

  useEffect(() => {
    if (!user_id) return;
    console.log(username);

    socketRef.current = new WebSocket(`ws://${import.meta.env.VITE_MATCHING_SERVICE_API}`);

    socketRef.current?.addEventListener('open', () => {
      socketRef.current?.send(JSON.stringify({ type: 'register', user_id, username }));
    });

    socketRef.current?.addEventListener('message', (data) => {
      data = JSON.parse(data);

      if (data?.type === 'timeout') {
        setState(null);
      } 
      
      else if (data?.type === 'opponent_disconnected') {
        toast(`${data?.username} disconnected`);
      } 
      
      else if (data?.type === 'opponent_left') {
        toast(`${data?.username} left`);
      }

      else if (data?.type === 'matched') {
        console.log('matched', data);
        setState(states.matched);
        setStateData(data);
      }

      else if (data?.type === 'reconnected') {
        setState(states.matched);
        setStateData(data);
      }

      else if (data?.type === 'matching') {
        setState(states.matching);
        setStateData(data);
      }

      return () => socketRef.current?.close();
    })

  }, [user_id]);

  function leave() {
    socketRef.current?.send(JSON.stringify({ type: 'leave', user_id }));
  }

  async function request_match(difficulties, topics) {
    try {
      const res = await matching_api.post('/join-queue', { topics, difficulties }, 
        { headers: {authorization: `Bearer ${accessToken}`} });
      const message = res.data?.message;
      if (message === 'match found') {
        setState(states.matched);
        setStateData(res.data);
      } else if (message === 'user added to queue') {
        setState(states.matching);
      }
    } catch (err) {
      toast(err?.reponse?.data?.message ?? err?.message);
    } 
  }

  return {
    username,
    state,
    stateData,
    leave,
    request_match,
  }
} 