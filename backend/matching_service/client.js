import io from 'socket.io-client';

function attach_event_listeners(socket, username) {
    socket.on('user disconnected', (username) => {
    console.log(`${username} disconnected from the room`);
    });

    socket.on('user left', (username) => {
        console.log(`${username} left the room`);
    });

    socket.on('user rejoined', (username) => {
        console.log(`${username} rejoined the room`);
    });

    socket.on('match found', (state) => {
        const other = state.users.find(user => user !== username);
        console.log(`match found with ${other}`);
    })
}

const socket1 = io('http://localhost:3002');
const socket2 = io('http://localhost:3002');

async function run(socket, username) {
    const req = { difficulties: ['easy'], tags: ['array'] };
    attach_event_listeners(socket, username);
    await socket.emitWithAck('register', username);
    await socket.emitWithAck('request match', username, req);
}

await Promise.all([run(socket1, 'tom'), run(socket2, 'jim')]);