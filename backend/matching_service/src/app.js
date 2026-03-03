import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { MatchingService, states } from './matching_service.js';

const app = express();
export const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  }
});

const username_to_socketid = new Map();
let matching_service = new MatchingService();

export function server_reset() {
    username_to_socketid.clear();
    matching_service = new MatchingService();
}

// register, request match, leave all have acknowledgements.
// connect, disconnect no need acknowledgements.

io.on('connection', (socket) => {
    socket.on('register', async (username, ack) => {
        socket.username = username;
        username_to_socketid.set(username, socket.id);
        const state = await matching_service.register(username);
        ack(state);

        if (state.state === states.matched) {
            const other_user = state.users.find(user => user !== username);
            socket.emit('user rejoined', other_user);
        }
    });

    socket.on('request match', async (username, req, ack) => {
        const state = await matching_service.request_match(username, req);
        ack(state);

        if (state.state === states.matched) {
            const [user1, user2] = state.users;
            io.to(state.users.map(user => username_to_socketid.get(user))).emit('match found', state);
        }
    })

    socket.on('leave', async (username, ack) => {
        const state = await matching_service.leave(username);
        ack(state);
        
        if (state && state.state === states.matched) {
            const other_user = state.users.find(user => user !== username);
            const other_socketid = username_to_socketid.get(other_user);
            io.to(other_socketid).emit('user left', username);
        }
    });

    socket.on('disconnect', async () => {
        const state = await matching_service.disconnect(socket.username);
        if (state && state.state === states.matched) {
            const other_user = state.users.find(user => user !== socket.username);
            const other_socketid = username_to_socketid.get(other_user);
            io.to(other_socketid).emit('user disconnected', socket.username);
        }
    })
})