import { io as Client } from 'socket.io-client';

const client = Client('http://localhost:3004');

client.on('new message', (msg) => console.log(msg));
client.on('initial connect', (msgs) => console.log(msgs));

client.emit('join room', 'jim', 1);
client.emit('new message', 'jim', 'hello I am jim');

client.disconnect();
client.connect();
client.emit('join room', 'jim', 1);
