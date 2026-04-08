import { Server } from "socket.io";

const io = new Server(3004, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] },
});

io.on("connection", (socket) => {
  console.log("user connected");

  socket.on("join_room", ({ roomId }) => {
    socket.join(roomId);
    console.log(`joined room ${roomId}`);
  });

  socket.on("send_message", ({ roomId, message, sender }) => {
    const payload = {
      message,
      sender,
      timestamp: Date.now(),
    };

    // send to everyone else in room
    socket.to(roomId).emit("receive_message", payload);

    socket.emit("receive_message", payload);
  });
});
