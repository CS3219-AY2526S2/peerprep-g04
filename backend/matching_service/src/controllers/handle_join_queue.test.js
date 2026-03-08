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

test('user can join queue with valid topics and difficulties', async () => {
    const res = await request(app)
        .post('/join-queue')
        .set('Authorization', `Bearer ${valid_token}`)
        .send({ topics: ['arrays', 'graphs'], difficulties: ['easy', 'medium'] });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('user added to queue');
});

test('join queue fails without token', async () => {
    const res = await request(app)
        .post('/join-queue')
        .send({ topics: ['arrays'], difficulties: ['easy'] });

    expect(res.status).toBe(400);
});

test('join queue fails when topics is not an array', async () => {
    const res = await request(app)
        .post('/join-queue')
        .set('Authorization', `Bearer ${valid_token}`)
        .send({ topics: 'arrays', difficulties: ['easy'] });

    expect(res.status).toBe(400);
});

test('join queue fails with empty topics', async () => {
    const res = await request(app)
        .post('/join-queue')
        .set('Authorization', `Bearer ${valid_token}`)
        .send({ topics: [], difficulties: ['easy'] });

    expect(res.status).toBe(400);
});

test('join queue fails with invalid difficulty', async () => {
    const res = await request(app)
        .post('/join-queue')
        .set('Authorization', `Bearer ${valid_token}`)
        .send({ topics: ['arrays'], difficulties: ['invalid'] });

    expect(res.status).toBe(400);
});