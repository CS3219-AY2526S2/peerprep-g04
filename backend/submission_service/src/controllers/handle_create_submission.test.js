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

test('create submission successful', async () => {    
    const res = await request(app)
        .post('/create-submission')
        .set('authorization', `Bearer ${valid_token}`)
        .send({
            user_id: test_user_id,
            question_id: 1,
            lang: 'javascript',
            code: 'console.log("hello")',
            status: 'Accepted'
        });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('submission');
    expect(res.body.submission).toMatchObject({
        user_id: test_user_id,
        question_id: 1,
        lang: 'javascript',
        code: 'console.log("hello")',
        status: 'Accepted'
    });
});

test('create submission missing fields', async () => {
    const res = await request(app)
        .post('/create-submission')
        .set('authorization', `Bearer ${valid_token}`)
        .send({
            user_id: test_user_id,
            question_id: 1
        });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'Missing required fields: question_id, lang, code, status');
});

test('create submission unauthorized (no token)', async () => {
    const res = await request(app)
        .post('/create-submission')
        .send({
            user_id: test_user_id,
            question_id: 1,
            lang: 'javascript',
            code: 'console.log("hello")',
            status: 'Accepted'
        });

    expect(res.status).toBe(400); 
});