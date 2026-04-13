import { app } from "../app.js";
import { pool } from "../database/db.js";
import { beforeEach, afterAll, test, expect } from "vitest";
import request from "supertest";
import jwt from 'jsonwebtoken';

const test_user_id = 999;
const valid_token = jwt.sign({ user_id: test_user_id }, process.env.JWT_SECRET_KEY);

beforeEach(async () => {
    await pool.query(`DELETE FROM submission_attempts;`);
});

afterAll(async () => {
    await pool.query(`DELETE FROM submission_attempts;`);
});

test('get submission history successfully', async () => {
    await pool.query(
        `INSERT INTO submission_attempts (user_id, question_id, lang, code, status) 
         VALUES ($1, $2, $3, $4, $5)`,
        [test_user_id, 101, 'python', 'print("hello")', 'Accepted']
    );

    const res = await request(app)
        .get('/get-submission-history/101')
        .set('authorization', `Bearer ${valid_token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('submissions');
    expect(Array.isArray(res.body.submissions)).toBe(true);
    expect(res.body.submissions.length).toBe(1);
    expect(res.body.submissions[0].question_id).toBe(101);
    expect(res.body.submissions[0].user_id).toBe(test_user_id);
});

test('return empty list if no history exists', async () => {
    const res = await request(app)
        .get('/get-submission-history/999')
        .set('authorization', `Bearer ${valid_token}`);

    expect(res.status).toBe(200);
    expect(res.body.submissions).toEqual([]);
});

test('fail for invalid question id (not a number)', async () => {
    const res = await request(app)
        .get('/get-submission-history/not-a-number')
        .set('authorization', `Bearer ${valid_token}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('invalid question id');
});

test('privacy check: do not return another user\'s submissions', async () => {
    await pool.query(
        `INSERT INTO submission_attempts (user_id, question_id, lang, code, status) 
         VALUES ($1, $2, $3, $4, $5)`,
        [67, 101, 'python', 'print("hello")', 'Accepted']
    );

    const res = await request(app)
        .get('/get-submission-history/101')
        .set('authorization', `Bearer ${valid_token}`);

    expect(res.status).toBe(200);
    expect(res.body.submissions.length).toBe(0);
});