import { test, expect, beforeEach, afterAll } from 'vitest';
import { redis } from '../database/db.js';
import request from 'supertest';
import { app } from '../app.js';
import jwt from 'jsonwebtoken';

const test_user_id = 999;
const valid_token = jwt.sign({ user_id: test_user_id }, process.env.JWT_SECRET_KEY);

beforeEach(async () => {
    await redis.flushAll();
});

afterAll(async () => {
    await redis.flushAll();
});

test('user can leave queue after joining', async () => {
    await request(app)
        .post('/join-queue')
        .set('Authorization', `Bearer ${valid_token}`)
        .send({ topic: 'arrays', difficulty: 'easy' });

    const res = await request(app)
        .delete('/leave-queue')
        .set('Authorization', `Bearer ${valid_token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('user removed from queue');
});

test('leave queue fails if user is not in queue', async () => {
    const res = await request(app)
        .delete('/leave-queue')
        .set('Authorization', `Bearer ${valid_token}`);

    expect(res.status).toBe(404);
});

test('leave queue fails without token', async () => {
    const res = await request(app)
        .delete('/leave-queue');

    expect(res.status).toBe(400);
});