import { app } from "../app.js";
import { pool } from "../database/db.js";
import { beforeEach, afterAll, test, expect } from "vitest";
import request from "supertest";

let user;
let token;

beforeEach(async () => {
    await pool.query(`DELETE FROM users;`);
    await pool.query(`DELETE FROM submission_attempts;`);
});

afterAll(async () => {
    await pool.query(`DELETE FROM users;`);
    await pool.query(`DELETE FROM submission_attempts;`);
});

test('create submission successful', async () => {
    const res = await request(app)
        .post('/create-user')
        .send({
            username: 'tom',
            email: 'tom@gmail.com',
            password: 'abc',
        });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('access_token').toHaveProperty('user_id');
    
    const res2 = await request(app)
        .post('/create-submission')
        .set('authorization', `Bearer ${res.body.access_token}`)
        .send({
            user_id: res.body.user_id,
            question_id: 1,
            lang: 'javascript',
            code: 'console.log("hello")',
            status: 'pending'
        });

    expect(res2.status).toBe(201);
    expect(res2.body).toHaveProperty('submission');
    expect(res2.body.submission).toMatchObject({
        user_id: res.body.user_id,
        question_id: 1,
        lang: 'javascript',
        code: 'console.log("hello")',
        status: 'pending'
    });
});

test('create submission missing fields', async () => {
    const res = await request(app)
        .post('/create-user')
        .send({
            username: 'tom',
            email: 'tom@gmail.com',
            password: 'abc',
        });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('access_token').toHaveProperty('user_id');

    const res2 = await request(app)
        .post('/create-submission')
        .set('authorization', `Bearer ${res.body.access_token}`)
        .send({
            user_id: res.body.user_id,
            question_id: 1
        });

    expect(res2.status).toBe(400);
    expect(res2.body).toHaveProperty('message', 'Missing required fields: user_id, question_id, lang, code, status');
});

test('create submission with wrong user_id', async () => {
    const res = await request(app)
        .post('/create-user')
        .send({
            username: 'tom',
            email: 'tom@gmail.com',
            password: 'abc',
        });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('access_token').toHaveProperty('user_id');

    const res2 = await request(app)
        .post('/create-submission')
        .set('authorization', `Bearer ${res.body.access_token}`)
        .send({
            user_id: 999,
            question_id: 1,
            lang: 'javascript',
            code: 'console.log("hello")',
            status: 'pending'
        });

    expect(res2.status).toBe(403);
    expect(res2.body).toHaveProperty('message', 'Cannot submit on behalf of another user');
});