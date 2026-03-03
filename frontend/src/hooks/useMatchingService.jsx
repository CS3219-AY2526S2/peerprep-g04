import { useState, useRef, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import { UserContext } from "./useUserService";

export function useMatchingService() {
  const username = useContext(UserContext)?.user?.username;
  const [state, setState] = useState();
  const socketRef = useRef();
  
  useEffect(() => {
    // username can be undefined, when the website first loads and then check for the cached jwt token.
    // in that case, we should not connect to the server yet.
    if (!username) {
      return;
    }

    socketRef.current = io(`http://${import.meta.env.VITE_MATCHING_SERVICE_API}`);
    socketRef.current.emitWithAck('register', username).then(state => {
      setState(state);
    });
    
    socketRef.current?.on('match found', (state) => setState(state));

    socketRef.current?.on('user rejoined', (other_user) => toast(`${other_user} rejoined the room`));

    socketRef.current?.on('user left', (other_user) => toast(`${other_user} left the room`));

    socketRef.current?.on('user disconnected', (other_user) => toast(`${other_user} disconnected from the room`));

    return () => {
      socketRef.current?.disconnect();
    }
  }, [username]);

  async function leave() {
    await socketRef.current?.emitWithAck('leave', username);
  }

  // difficulties: string[], tags: string[]
  async function request_match(difficulties, tags) {
    const next_state = await socketRef.current?.emitWithAck('request match', username, { difficulties, tags });
    setState(next_state);
  }

  return {
    username,
    state, 
    leave,
    request_match,
  };
}