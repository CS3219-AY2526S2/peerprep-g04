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

test('two users with same topic and difficulty get matched', async () => {
    // user1 joins first, no match yet
    const res1 = await request(app)
        .post('/join-queue')
        .set('Authorization', `Bearer ${token1}`)
        .send({ topic: 'arrays', difficulty: 'easy' });

    expect(res1.status).toBe(200);
    expect(res1.body.message).toBe('user added to queue');

    // user2 joins, match found
    const res2 = await request(app)
        .post('/join-queue')
        .set('Authorization', `Bearer ${token2}`)
        .send({ topic: 'arrays', difficulty: 'easy' });

    expect(res2.status).toBe(200);
    expect(res2.body.message).toBe('match found');
    expect(res2.body.opponent_id).toBe(user1_id);
});

test('two users with different topics do not get matched', async () => {
    const res1 = await request(app)
        .post('/join-queue')
        .set('Authorization', `Bearer ${token1}`)
        .send({ topic: 'arrays', difficulty: 'easy' });

    const res2 = await request(app)
        .post('/join-queue')
        .set('Authorization', `Bearer ${token2}`)
        .send({ topic: 'graphs', difficulty: 'easy' });

    expect(res1.body.message).toBe('user added to queue');
    expect(res2.body.message).toBe('user added to queue');
});

test('two users with different difficulties do not get matched', async () => {
    const res1 = await request(app)
        .post('/join-queue')
        .set('Authorization', `Bearer ${token1}`)
        .send({ topic: 'arrays', difficulty: 'easy' });

    const res2 = await request(app)
        .post('/join-queue')
        .set('Authorization', `Bearer ${token2}`)
        .send({ topic: 'arrays', difficulty: 'hard' });

    expect(res1.body.message).toBe('user added to queue');
    expect(res2.body.message).toBe('user added to queue');
});

test('match is saved to database', async () => {
    await request(app)
        .post('/join-queue')
        .set('Authorization', `Bearer ${token1}`)
        .send({ topic: 'arrays', difficulty: 'easy' });

    const res = await request(app)
        .post('/join-queue')
        .set('Authorization', `Bearer ${token2}`)
        .send({ topic: 'arrays', difficulty: 'easy' });

    expect(res.body.match_id).toBeDefined();

    const db_result = await pool.query('SELECT * FROM matches WHERE id = $1', [res.body.match_id]);
    expect(db_result.rows).toHaveLength(1);
    expect(db_result.rows[0].topic).toBe('arrays');
    expect(db_result.rows[0].difficulty).toBe('easy');
});

test('both users are removed from queue after match', async () => {
    await request(app)
        .post('/join-queue')
        .set('Authorization', `Bearer ${token1}`)
        .send({ topic: 'arrays', difficulty: 'easy' });

    await request(app)
        .post('/join-queue')
        .set('Authorization', `Bearer ${token2}`)
        .send({ topic: 'arrays', difficulty: 'easy' });

    const status1 = await request(app)
        .get('/queue-status')
        .set('Authorization', `Bearer ${token1}`);

    const status2 = await request(app)
        .get('/queue-status')
        .set('Authorization', `Bearer ${token2}`);

    expect(status1.body.in_queue).toBe(false);
    expect(status2.body.in_queue).toBe(false);
});