import { app } from "../app.js";
import { pool } from "../database/db.js";
import { beforeEach, afterAll, test, expect } from "vitest";
import request from "supertest";

let user;
let token;

beforeEach(async () => {
    await pool.query(`DELETE FROM users;`);
    await pool.query(`DELETE FROM submission_attempts;`);

    const res = await request(app)
        .post('/create-user')
        .send({
            username: 'tester',
            email: 'test@gmail.com',
            password: 'abc',
        });
    
    token = res.body.access_token;
    user = res.body;
});

afterAll(async () => {
    await pool.query(`DELETE FROM users;`);
    await pool.query(`DELETE FROM submission_attempts;`);
});

test('get submission history successfully', async () => {
    await request(app)
        .post('/create-submission')
        .set('authorization', `Bearer ${token}`)
        .send({
            user_id: user.user_id,
            question_id: 101,
            lang: 'python',
            code: 'print("hello")',
            status: 'completed'
        });

    const res = await request(app)
        .get('/get-submission-history/101')
        .set('authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('submissions');
    expect(Array.isArray(res.body.submissions)).toBe(true);
    expect(res.body.submissions.length).toBe(1);
    expect(res.body.submissions[0].question_id).toBe(101);
});

test('return empty list if no history exists', async () => {
    const res = await request(app)
        .get('/get-submission-history/999')
        .set('authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.submissions).toEqual([]);
});

test('fail for invalid question id (not a number)', async () => {
    const res = await request(app)
        .get('/get-submission-history/not-a-number')
        .set('authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('invalid question id');
});

test('privacy check: do not return another user\'s submissions', async () => {
    const userBRes = await request(app)
        .post('/create-user')
        .send({ username: 'userB', email: 'b@gmail.com', password: '123' });

    await request(app)
        .post('/create-submission')
        .set('authorization', `Bearer ${userBRes.body.access_token}`)
        .send({
            user_id: userBRes.body.user_id,
            question_id: 101,
            lang: 'js',
            code: 'console.log("B")',
            status: 'completed'
        });

    const res = await request(app)
        .get('/get-submission-history/101')
        .set('authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.submissions.length).toBe(0);
});