import { Server } from 'socket.io';
import express from 'express';
import http from 'http';
import { joinRoom, newMessage, leave } from './message.js';
import jwt from 'jsonwebtoken';

const app = express();
export const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  }
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error("Authentication error: Token missing"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    socket.user = decoded; 
    //console.log('verified');
    next();
  } catch (err) {
    //console.log('failed');
    next(new Error("Authentication error: Invalid token"));
  }
});

io.on('connection', (socket) => {
  socket.on('join room', (username, roomId) => {
    joinRoom(username, roomId, socket);
  });

  socket.on('new message', (username, message) => {
    newMessage(username, message, io);
  });

  socket.on('leave', (username) => {
    leave(username, socket);
  })
});
