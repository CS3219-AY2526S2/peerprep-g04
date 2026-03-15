import { test, expect, beforeEach, afterAll, vi } from 'vitest';
import { redis, enqueue_user, is_user_in_queue, dequeue_user } from './database/db.js';
import { clients, notify_timeout, notify_match, notify_opponent_disconnected, notify_opponent_left } from './websocket.js';

beforeEach(async () => {
    await redis.flushAll();
    clients.clear();
});

afterAll(async () => {
    await redis.flushAll();
    clients.clear();
});

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

    notify_match(user_id1, user_id2, ['arrays'], ['easy']);

    expect(mock_ws1.send).toHaveBeenCalledWith(
        JSON.stringify({ type: "matched", opponent_id: user_id2, topics: ['arrays'], difficulties: ['easy'] })
    );
    expect(mock_ws2.send).toHaveBeenCalledWith(
        JSON.stringify({ type: "matched", opponent_id: user_id1, topics: ['arrays'], difficulties: ['easy'] })
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

    notify_opponent_disconnected(opponent_id, 1);

    expect(mock_ws.send).toHaveBeenCalledWith(
        JSON.stringify({ type: "opponent_disconnected", user_id: 1 })
    );
});

test('notify_opponent_left sends message to opponent', () => {
    const opponent_id = 2;
    const mock_ws = { readyState: 1, send: vi.fn() };
    clients.set(opponent_id, mock_ws);

    notify_opponent_left(opponent_id, 1);

    expect(mock_ws.send).toHaveBeenCalledWith(
        JSON.stringify({ type: "opponent_left", user_id: 1 })
    );
});