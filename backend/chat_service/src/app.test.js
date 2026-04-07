import { server } from "./app";
import { io as Client } from 'socket.io-client';
import { resetServer } from "./message";
import { io } from "./app";

import { beforeEach, afterEach, vi, test, expect } from 'vitest';

let client1, client2;
let PORT = 6069;
let URL = `http://localhost:${PORT}`;

beforeEach(() => {
    server.listen(PORT);
    client1 = Client(URL);
    client2 = Client(URL);
});

afterEach(() => {
    client1.disconnect();
    client1.removeAllListeners();
    client2.disconnect();
    client2.removeAllListeners();
    resetServer();
    io.close();
});

const waiting = {
    timeout: 1000,
    interval: 50,
}

test('1 connection', async () => {
    const cb = vi.fn();
    const cb2 = vi.fn();
    client1.on('new message', cb);
    client1.on('join room', cb2);
    
    client1.emit('join room', 'tim', 1);
    client1.emit('new message', 'tim', 'hello world');
    
    await vi.waitFor(() => {
        expect(cb).toHaveBeenCalled();
        expect(cb2).toHaveBeenCalled();
    }, waiting)
});

test('2 connections to the same room', async () => {
    const cb = vi.fn();
    
    client1.on('new message', cb);
    client2.on('new message', cb);

    client1.emit('join room', 'tim', 1);
    client2.emit('join room', 'jim', 1);
    client2.emit('new message', 'jim', 'hello world');

    await vi.waitFor(() => {
        expect(cb).toHaveBeenCalledTimes(2);
    }, waiting);
});

test('2 connections to different room', async () => {
    const cb = vi.fn();
    
    client1.on('new message', cb);
    client2.on('new message', cb);

    client1.emit('join room', 'tim', 1);
    client2.emit('join room', 'jim', 2);
    client2.emit('new message', 'jim', 'hello world');

    await vi.waitFor(() => {
        expect(cb).toHaveBeenCalledTimes(1);
    }, waiting);
});

test('2 connections to same room more messages', async () => {
    const cb = vi.fn();
    const cb2 = vi.fn();
    
    client1.on('new message', cb);
    client1.on('join room', cb2);
    client2.on('new message', cb);
    client2.on('join room', cb2);

    client1.emit('join room', 'tim', 1);
    client2.emit('join room', 'jim', 2);

    for (let i = 0; i < 10; i++) {
        client1.emit('new message', 'tim', 'hello world');
        client2.emit('new message', 'jim', 'hello world');
    }

    await vi.waitFor(() => {
        expect(cb2).toHaveBeenCalledTimes(2);
        expect(cb).toHaveBeenCalledTimes(20);
    }, waiting);
});

test('change room', async () => {
    const cb = vi.fn();
    const cb2 = vi.fn();
    
    client1.on('new message', cb);
    client1.on('join room', cb2);
    client2.on('new message', cb);
    client2.on('join room', cb2);

    client1.emit('join room', 'tim', 1);
    client2.emit('join room', 'jim', 1);
    client1.emit('join room', 'tim', 2);

    // must wait for client 1 to actually switch rooms.
    await vi.waitFor(() => {
        expect(cb2).toHaveBeenCalledTimes(3);
    })

    client2.emit('new message', 'jim', 'hello world');

    await vi.waitFor(() => {
        expect(cb).toHaveBeenCalledTimes(1);
    }, waiting);
})