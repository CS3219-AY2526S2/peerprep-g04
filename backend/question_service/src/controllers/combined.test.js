import { afterAll, beforeEach, test, expect } from "vitest";
import { pool } from "../database/db.js";
import request from 'supertest';
import { app } from "../app.js";
import { valid_token } from "./handle_create_question.test.js";

beforeEach(async () => {
    await pool.query(`DELETE FROM questions`);
})

afterAll(async () => {
    await pool.query(`DELETE FROM questions`);
})

test('create and get question', async () => {
    const q1 = {
        title: 't1',
        difficulty: 'easy',
        tags: ['array', 'dp'],
        body: 'hello world',
    }

    const res = await request(app).post('/create-question').set('Authorization', `Bearer ${valid_token}`).send(q1);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    
    const id = res.body.id;
    const res2 = await request(app).get(`/get-question-by-id/${id}`);
    expect(res2.status).toBe(200);
    expect(res2.body).toMatchObject(q1);
})

test('create, get and update question', async () => {
    const q1 = {
        title: 't1',
        difficulty: 'easy',
        tags: ['array', 'dp'],
        body: 'hello world',
    }
    const q2 = {
        tags: ['segment tree'],
    }

    const res = await request(app)
        .post('/create-question')
        .set('Authorization', `Bearer ${valid_token}`)
        .send(q1);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');

    const id = res.body.id;
    const res2 = await request(app)
        .patch(`/update-question/${id}`)
        .set('Authorization', `Bearer ${valid_token}`)
        .send(q2);
    expect(res2.status).toBe(200);

    const res3 = await request(app).get(`/get-question-by-id/${id}`);
    expect(res3.status).toBe(200);
    expect(res3.body).toMatchObject({...q1, ...q2});

})