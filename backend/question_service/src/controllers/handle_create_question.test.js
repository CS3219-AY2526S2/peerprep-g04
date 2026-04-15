import { afterAll, beforeEach, test, expect } from "vitest";
import { get_question_by_id, pool } from "../database/db.js";
import request from 'supertest';
import { app } from "../app.js";
import jwt from 'jsonwebtoken';

export const valid_token = jwt.sign({ user_id: 1, access: 'admin' }, process.env.JWT_SECRET_KEY);

beforeEach(async () => {
    await pool.query(`DELETE FROM questions`);
})

afterAll(async () => {
    await pool.query(`DELETE FROM questions`);
})

test('create question successful', async () => {
    const q1 = {
        title: 't1',
        difficulty: 'medium',
        tags: ['pq', 'dp'],
        body: 'hello world',
        test_case: { input: 't', expected_output: 't' },
    }
    const res = await request(app)
        .post('/create-question')
        .set('Authorization', `Bearer ${valid_token}`)
        .send(q1);


    expect(res.body).toHaveProperty('id');
    const id = res.body.id;
    const q = await get_question_by_id(id);
    expect(q.title).toBe('t1');
    expect(q.difficulty).toBe('medium');
    expect(q.body).toBe('hello world');
});
