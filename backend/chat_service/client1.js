import { io as Client } from 'socket.io-client';

const client = Client('http://localhost:3004');

client.on('new message', (msg) => console.log(msg));
//client.on('reconnect', (msgs) => console.log(msgs));

client.emit('join room', 'tim', 1);
client.emit('new message', 'tim', 'hello I am tim');

client.disconnect();
client.connect();
client.emit('join room', 'tim', 1);


