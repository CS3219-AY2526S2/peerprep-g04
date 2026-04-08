import { io } from "socket.io-client";

export const socket = io(`http://${import.meta.env.VITE_CHAT_SERVICE_API}`, {
  autoConnect: false,
});