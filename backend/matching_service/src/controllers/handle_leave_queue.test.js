import { test, expect, beforeEach, afterAll, vi } from 'vitest';
import { redis, pool } from '../database/db.js';
import * as db from '../database/db.js';
import * as websocket from '../websocket.js';
import request from 'supertest';
import { app } from '../app.js';
import jwt from 'jsonwebtoken';

const user1_id = 1;
const user2_id = 2;
const token1 = jwt.sign({ user_id: user1_id }, process.env.JWT_SECRET_KEY);
const token2 = jwt.sign({ user_id: user2_id }, process.env.JWT_SECRET_KEY);

beforeEach(async () => {
    await redis.flushAll();
    await pool.query('DELETE FROM matches');
});

afterAll(async () => {
    await redis.flushAll();
    await pool.query('DELETE FROM matches');
});

test('user can leave queue after joining', async () => {
    await request(app)
        .post('/join-queue')
        .set('Authorization', `Bearer ${token1}`)
        .send({ topics: ['arrays'], difficulties: ['easy'] });

    const res = await request(app)
        .delete('/leave-queue')
        .set('Authorization', `Bearer ${token1}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('user removed from queue');
});

test('leave queue fails if user is not in queue and not matched', async () => {
    const res = await request(app)
        .delete('/leave-queue')
        .set('Authorization', `Bearer ${token1}`);

    expect(res.status).toBe(404);
});

test('leave queue fails without token', async () => {
    const res = await request(app)
        .delete('/leave-queue');

    expect(res.status).toBe(400);
});

test('matched user can leave and opponent is notified', async () => {
    // match two users
    await request(app)
        .post('/join-queue')
        .set('Authorization', `Bearer ${token1}`)
        .send({ topics: ['arrays'], difficulties: ['easy'] });

    await request(app)
        .post('/join-queue')
        .set('Authorization', `Bearer ${token2}`)
        .send({ topics: ['arrays'], difficulties: ['easy'] });

    // user1 leaves after being matched
    const res = await request(app)
        .delete('/leave-queue')
        .set('Authorization', `Bearer ${token1}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('user removed from queue');
});

test('user in matching state leaves without notifying any opponent', async () => {
    const spy = vi.spyOn(websocket, 'notify_opponent_left');

    // user1 joins queue: state = matching
    await request(app)
        .post('/join-queue')
        .set('Authorization', `Bearer ${token1}`)
        .send({ topics: ['arrays'], difficulties: ['easy'] });

    const res = await request(app)
        .delete('/leave-queue')
        .set('Authorization', `Bearer ${token1}`);

    expect(res.status).toBe(200);
    expect(spy).not.toHaveBeenCalled();

    spy.mockRestore();
});

test('user in matched state leaves and correct opponent is notified', async () => {
    const notifySpy = vi.spyOn(websocket, 'notify_opponent_left');
    const matchSpy = vi.spyOn(db, 'get_match_by_user_id').mockResolvedValue({
        id: 1,
        user1_id: user1_id,
        user2_id: user2_id,
        question_id: 100,
    });

    // set user1 as matched directly in Redis
    await redis.set(`user_state:${user1_id}`, 'matched');

    const res = await request(app)
        .delete('/leave-queue')
        .set('Authorization', `Bearer ${token1}`);

    expect(res.status).toBe(200);
    expect(notifySpy).toHaveBeenCalledWith(user2_id, user1_id);

    notifySpy.mockRestore();
    matchSpy.mockRestore();
});
