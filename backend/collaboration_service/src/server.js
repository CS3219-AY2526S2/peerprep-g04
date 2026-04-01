#!/usr/bin/env node

import { WebSocketServer } from 'ws'
import http from 'http'
import * as number from 'lib0/number'
import { setupWSConnection } from './utils.js'
import jwt from 'jsonwebtoken';

const wss = new WebSocketServer({ noServer: true })
const host = process.env.HOST || '0.0.0.0'
const port = number.parseInt(process.env.PORT || '3004')

const server = http.createServer((_request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/plain' })
  response.end('okay')
})

wss.on('connection', setupWSConnection)

server.on('upgrade', (request, socket, head) => {
  // You may check auth of request here..
  // Call `wss.HandleUpgrade` *after* you checked whether the client has access
  // (e.g. by checking cookies, or url parameters).
  // See https://github.com/websockets/ws#client-authentication
  try {
    const url = new URL(request.url, `http:${request.headers.host}`);
    const token = url.searchParams.get('token').split('/')[0];
    const user = jwt.verify(token, process.env.JWT_SECRET_KEY);
    
    wss.handleUpgrade(request, socket, head, /** @param {any} ws */ ws => {
      wss.emit('connection', ws, request)
    });
  } catch (err) {
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
    socket.destroy();
  }
 
})

server.listen(port, host, () => {
  console.log(`running at '${host}' on port ${port}`)
})
