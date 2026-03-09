import {WebSocketServer} from 'ws';
import http from 'http';

// ws uses 4444 by default
const port = process.env.PORT || 4444;
const wss = new WebSocketServer({ noServer: true });


const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' }),
    res.end("Server is up and running")
});

// Listeners for server
server.on('upgrade', (req, socket, head) => {
    wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req)
    })
});

// y-webrtc logic for signaling
wss.on('connection', (connection, req) => {
    // Default vals
});     

server.listen(port, () => {
    console.log(`Collaboration service listening on port ${port}`);
});