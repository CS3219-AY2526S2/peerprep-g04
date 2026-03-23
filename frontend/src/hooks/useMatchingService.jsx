import axios from "axios";
import { UserContext } from "./useUserService";
import { useContext, useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { getMatchingServiceSocket } from "../services/webSocketSingleton";

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

    // replacing with local ws, instead of mutable shared sockerRef so that correct socket is closed later
    const ws = getMatchingServiceSocket(user_id, username);
    socketRef.current = ws;

    ws.addEventListener('message', (res) => {
      const data = JSON.parse(res.data);

      if (data?.type === 'timeout') {
        setState(null);
      } 
      
      else if (data?.type === 'opponent_disconnected') {
        toast(`${data?.username} disconnected`, { position: 'top-center'});
      } 
      
      else if (data?.type === 'opponent_left') {
        toast(`${data?.username} left`, { position: 'top-center'});
      }

      else if (data?.type === 'opponent_reconnect') {
        toast(`${data?.username} reconnected`, { position: 'top-center' });
      }

      else if (data?.type === 'matched') {
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
    });

    // effect was running multiple times, creating multiple sockets
    // also cleanup was called on unmount, so the socket closed anyway when the effect ran again
    // moved ws.close() to leave button
    return () => {
      ws.removeEventListener('message', () => {});

      socketRef.current = null;
    };
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
      toast(err?.response?.data?.message ?? err?.message);
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