import { afterAll, beforeEach, test, expect } from "vitest";
import { create_question, create_question_from_obj, get_question_by_id, pool } from "../database/db.js";
import request from 'supertest';
import { app } from "../app.js";

beforeEach(async () => {
    await pool.query(`DELETE FROM questions`);
})

afterAll(async () => {
    await pool.query(`DELETE FROM questions`);
})

test('update question successful', async () => {
    const q1 = {
        title: 't1',
        difficulty: 'medium',
        tags: ['pq', 'dp'],
        body: 'hello world',
    }
    const q2 = {
        title: 't2',
        difficulty: 'easy',
        tags: ['array'],
        body: 'nus',
    }
    const id = await create_question_from_obj(q1);
    const res = await request(app)
        .patch(`/update-question/${id}`)
        .send(q2);
    expect(res.status).toBe(200);
    const question = await get_question_by_id(id);
    expect(question).toMatchObject(q2);
});
