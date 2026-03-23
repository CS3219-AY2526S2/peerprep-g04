let socket = null;

export function getMatchingServiceSocket(user_id, username) {
    // already exists
    if (socket && socket.readyState !== WebSocket.CLOSED) {
        return socket;
    }   

    console.log("Creating WS...");

    socket = new WebSocket(`ws://${import.meta.env.VITE_MATCHING_SERVICE_API}`);

    socket.addEventListener("open", () => {
      socket.send(JSON.stringify({ type: "register", user_id, username }));
    });

    // Debug
    socket.addEventListener("close", () => {
      console.log("WS CLOSED");
    });

    socket.addEventListener("error", (err) => {
      console.error("WS ERROR", err);
    });

    return socket;
}

export function closeMatchingSocket() {
  if (socket) {
    socket.close();
    socket = null;
  }
}

