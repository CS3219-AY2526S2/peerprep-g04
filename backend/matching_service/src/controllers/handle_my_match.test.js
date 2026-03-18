import { test, expect, beforeEach, afterAll } from 'vitest';
import { redis, pool } from '../database/db.js';
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

test('returns 404 if user has no match', async () => {
    const res = await request(app)
        .get('/my-match')
        .set('Authorization', `Bearer ${token1}`);

    expect(res.status).toBe(404);
});

test('returns match info after user is matched', async () => {
    await request(app)
        .post('/join-queue')
        .set('Authorization', `Bearer ${token1}`)
        .send({ topics: ['arrays'], difficulties: ['easy'] });

    await request(app)
        .post('/join-queue')
        .set('Authorization', `Bearer ${token2}`)
        .send({ topics: ['arrays'], difficulties: ['easy'] });

    const res = await request(app)
        .get('/my-match')
        .set('Authorization', `Bearer ${token1}`);

    expect(res.status).toBe(200);
    expect(res.body.topic).toBe('arrays');
    expect(res.body.difficulty).toBe('easy');
});

test('returns 401 without token', async () => {
    const res = await request(app).get('/my-match');
    expect(res.status).toBe(400);
});