import { afterAll, beforeEach, test, expect } from "vitest";
import { get_question_by_id, pool } from "../database/db";
import request from 'supertest';
import { app } from "../app";

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
    }
    const res = await request(app)
        .post('/create-question')
        .send(q1);

    expect(res.body).toHaveProperty('id');
    const id = res.body.id;
    const q = await get_question_by_id(id);
    expect(q).toMatchObject(q1);
});
