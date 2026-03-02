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

test('queue status is false when user is not in queue', async () => {
    const res = await request(app)
        .get('/queue-status')
        .set('Authorization', `Bearer ${valid_token}`);

    expect(res.status).toBe(200);
    expect(res.body.in_queue).toBe(false);
});

test('queue status is true after user joins queue', async () => {
    await request(app)
        .post('/join-queue')
        .set('Authorization', `Bearer ${valid_token}`)
        .send({ topic: 'arrays', difficulty: 'easy' });

    const res = await request(app)
        .get('/queue-status')
        .set('Authorization', `Bearer ${valid_token}`);

    expect(res.status).toBe(200);
    expect(res.body.in_queue).toBe(true);
});

test('queue status is false after user leaves queue', async () => {
    await request(app)
        .post('/join-queue')
        .set('Authorization', `Bearer ${valid_token}`)
        .send({ topic: 'arrays', difficulty: 'easy' });

    await request(app)
        .delete('/leave-queue')
        .set('Authorization', `Bearer ${valid_token}`);

    const res = await request(app)
        .get('/queue-status')
        .set('Authorization', `Bearer ${valid_token}`);

    expect(res.status).toBe(200);
    expect(res.body.in_queue).toBe(false);
});