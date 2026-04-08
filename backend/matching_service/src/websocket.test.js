import { test, expect, beforeEach, beforeAll, afterAll, vi } from 'vitest';
import { redis, enqueue_user, is_user_in_queue, dequeue_user } from './database/db.js';
import * as db from './database/db.js';
import { clients, notify_timeout, notify_match, notify_opponent_disconnected, notify_opponent_left, user_id_to_username, init_websocket_server } from './websocket.js';
import { createServer } from 'http';
import { app } from './app.js';
import WebSocket from 'ws';

const WS_PORT = 4001;
let server;

beforeAll(() => {
    server = createServer(app);
    init_websocket_server(server);
    server.listen(WS_PORT);
});

beforeEach(async () => {
    await redis.flushAll();
    clients.clear();
});

afterAll(async () => {
    await redis.flushAll();
    clients.clear();
    server.close();
});

function connect_and_register(user_id, username) {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(`ws://localhost:${WS_PORT}`);
        ws.on('open', () => ws.send(JSON.stringify({ type: 'register', user_id, username })));
        ws.on('message', (data) => {
            if (JSON.parse(data.toString()).type === 'registered') resolve(ws);
        });
        ws.on('error', reject);
    });
}

test('notify_timeout sends timeout message to registered client', () => {
    const user_id = 1;
    const mock_ws = { readyState: 1, send: vi.fn() };
    clients.set(user_id, mock_ws);

    notify_timeout(user_id);

    expect(mock_ws.send).toHaveBeenCalledWith(
        JSON.stringify({ type: "timeout" })
    );
});

test('notify_timeout does nothing if user is not connected', () => {
    expect(() => notify_timeout(999)).not.toThrow();
});

test('notify_match sends matched message to both users', () => {
    const user_id1 = 1;
    const user_id2 = 2;
    const mock_ws1 = { readyState: 1, send: vi.fn() };
    const mock_ws2 = { readyState: 1, send: vi.fn() };
    clients.set(user_id1, mock_ws1);
    clients.set(user_id2, mock_ws2);

    user_id_to_username.set(user_id1, 'user1');
    user_id_to_username.set(user_id2, 'user2');
    notify_match(user_id1, user_id2, ['arrays'], ['easy'], 99, 1);

    expect(mock_ws1.send).toHaveBeenCalledWith(
        JSON.stringify({ type: "matched", match_id: 99, opponent_id: user_id2, opponent_username: 'user2', topics: ['arrays'], difficulties: ['easy'], question_id: 1 })
    );
    expect(mock_ws2.send).toHaveBeenCalledWith(
        JSON.stringify({ type: "matched", match_id: 99, opponent_id: user_id1, opponent_username: 'user1', topics: ['arrays'], difficulties: ['easy'], question_id: 1 })
    );
});

test('user is removed from queue on disconnect', async () => {
    await enqueue_user(1, ['arrays'], ['easy']);
    expect(await is_user_in_queue(1)).toBe(true);

    const removed = await dequeue_user(1);
    expect(removed).toBe(true);
    expect(await is_user_in_queue(1)).toBe(false);
});

test('notify_opponent_disconnected sends message to opponent', () => {
    const opponent_id = 2;
    const mock_ws = { readyState: 1, send: vi.fn() };
    clients.set(opponent_id, mock_ws);
    user_id_to_username.set(1, 'jim');

    notify_opponent_disconnected(opponent_id, 1);

    expect(mock_ws.send).toHaveBeenCalledWith(
        JSON.stringify({ type: "opponent_disconnected", user_id: 1, username: 'jim' })
    );
});

test('notify_opponent_left sends message to opponent', () => {
    const opponent_id = 2;
    const mock_ws = { readyState: 1, send: vi.fn() };
    clients.set(opponent_id, mock_ws);
    user_id_to_username.set(1, 'jim');

    notify_opponent_left(opponent_id, 1);

    expect(mock_ws.send).toHaveBeenCalledWith(
        JSON.stringify({ type: "opponent_left", user_id: 1, username: 'jim' })
    );
});

test('leave WS message does not notify opponent if opponent has re-queued', async () => {
    const user1_id = 10;
    const user2_id = 11;

    const user_states = {};
    vi.spyOn(db, 'get_user_state').mockImplementation(async (id) => user_states[id] ?? null);
    vi.spyOn(db, 'get_match_by_user_id').mockResolvedValue({ id: 1, user1_id: user1_id, user2_id: user2_id });

    const opponent_mock_ws = { readyState: 1, send: vi.fn() };
    clients.set(user2_id, opponent_mock_ws);

    const ws1 = await connect_and_register(user1_id, 'user1');

    // user1 matched, user2 has already re-queued (matching)
    user_states[user1_id] = 'matched';
    user_states[user2_id] = 'matching';

    ws1.send(JSON.stringify({ type: 'leave', user_id: user1_id }));
    await new Promise(r => setTimeout(r, 100));

    expect(opponent_mock_ws.send).not.toHaveBeenCalledWith(
        expect.stringContaining('opponent_left')
    );

    ws1.close();
    vi.restoreAllMocks();
});

test('leave WS message notifies opponent if opponent is still matched', async () => {
    const user1_id = 12;
    const user2_id = 13;

    const user_states = {};
    vi.spyOn(db, 'get_user_state').mockImplementation(async (id) => user_states[id] ?? null);
    vi.spyOn(db, 'get_match_by_user_id').mockResolvedValue({ id: 2, user1_id: user1_id, user2_id: user2_id });

    const opponent_mock_ws = { readyState: 1, send: vi.fn() };
    clients.set(user2_id, opponent_mock_ws);

    const ws1 = await connect_and_register(user1_id, 'user1');

    // both still matched
    user_states[user1_id] = 'matched';
    user_states[user2_id] = 'matched';

    ws1.send(JSON.stringify({ type: 'leave', user_id: user1_id }));
    await new Promise(r => setTimeout(r, 100));

    expect(opponent_mock_ws.send).toHaveBeenCalledWith(
        expect.stringContaining('opponent_left')
    );

    ws1.close();
    vi.restoreAllMocks();
});
