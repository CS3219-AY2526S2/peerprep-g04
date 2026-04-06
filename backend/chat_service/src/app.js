import { Server } from 'socket.io';
import express from 'express';
import http from 'http';
import { joinRoom, newMessage, leave } from './message.js';

const app = express();
export const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
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
