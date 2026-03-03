import { useState, useRef, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import { UserContext } from "./useUserService";

// must give the username, this is very important.
export function useMatchingService() {
  const username = useContext(UserContext)?.user?.username;
  const [state, setState] = useState();
  const socketRef = useRef();

  useEffect(() => {
    if (!username) return;

    socketRef.current = io(`http://${import.meta.env.VITE_MATCHING_SERVICE_API}`);
    socketRef.current.emitWithAck('register', username).then(state => {
      //console.log(state);
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
    state, 
    leave,
    request_match,
  };
}