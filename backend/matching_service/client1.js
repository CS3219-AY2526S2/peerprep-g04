import io from 'socket.io-client';

const socket = io('http://localhost:3002');

socket.on('user disconnected', (username) => {
    console.log(`${username} disconnected from the room`);
});

socket.on('user left', (username) => {
    console.log(`${username} left the room`);
});

socket.on('user rejoined', (username) => {
    console.log(`${username} rejoined the room`);
})

socket.on('user joined', (username) => {
    console.log(`${username} joined the room`);
})


const res1 = await socket.emitWithAck('register', 'tom');
console.log(res1);

const res2 = await socket.emitWithAck('request match', 'tom', { difficulties: ['easy'], tags: ['array'] });
console.log(res2);

