// server.test.js
import { describe, it, expect, beforeAll, afterAll, test, beforeEach, afterEach } from "vitest";
import { io as Client } from "socket.io-client";
import { server, server_reset } from "./app.js";
import { states } from "./matching_service.js";

const port = 6000;
let client1, client2;

beforeEach(async () => {
    server_reset();
    server.listen(port);
    client1 = Client(`http://localhost:${port}`);
    client2 = Client(`http://localhost:${port}`);
});

afterEach(async () => {
    client1.disconnect();
    client1.removeAllListeners();
    client2.disconnect();
    client2.removeAllListeners();
    server.close();
})

test('2 people register', async () => {
    const res_arr = await Promise.all([client1.emitWithAck('register', 'tom'), client2.emitWithAck('register', 'jim')]);
    expect(res_arr[0].state).toBe(states.register);
    expect(res_arr[1].state).toBe(states.register);
});

test('2 people register and match', async () => {
    const req = { difficulties: ['easy'], tags: ['array'] };

    async function c1() {
        await client1.emitWithAck('register', 'tom');
        const res2 = await client1.emitWithAck('request match', 'tom', req);
        return res2;
    }

    async function c2() {
        await client2.emitWithAck('register', 'jim');
        const res2 = await client2.emitWithAck('request match', 'jim', req);
        return res2;
    }
    
    c1();
    c2();

    const p1 = new Promise((res) => {
        client1.on('match found', (state) => res(state));
    });

    const p2 = new Promise((res) => {
        client2.on('match found', (state) => res(state));
    });

    const arr = await Promise.all([p1, p2]);
    expect(arr.every(res => res?.state === states.matched)).toBeTruthy();
});

test('2 people register and match, 1 person disconnect and rejoin', async () => {
    const req = { difficulties: ['easy'], tags: ['array'] };

    async function c1() {
        await client1.emitWithAck('register', 'tom');
        const res2 = await client1.emitWithAck('request match', 'tom', req);
        return res2;
    }

    async function c2() {
        await client2.emitWithAck('register', 'jim');
        const res2 = await client2.emitWithAck('request match', 'jim', req);
        return res2;
    }

    await Promise.all([c1(), c2()]);
    
    client2.disconnect();
    client2.connect();
    const res = await client2.emitWithAck('register', 'jim');
    expect(res.state).toBe(states.matched);
});

test('2 people register and match, 1 person leave', async() => {
    const req = { difficulties: ['easy'], tags: ['array'] };

    async function c1() {
        await client1.emitWithAck('register', 'tom');
        const res2 = await client1.emitWithAck('request match', 'tom', req);
        return res2;
    }

    async function c2() {
        await client2.emitWithAck('register', 'jim');
        const res2 = await client2.emitWithAck('request match', 'jim', req);
        return res2;
    }

    await Promise.all([c1(), c2()]);

    await client2.emitWithAck('leave', 'jim');
    const res = await client2.emitWithAck('register', 'jim');
    expect(res.state).toBe(states.register);

})