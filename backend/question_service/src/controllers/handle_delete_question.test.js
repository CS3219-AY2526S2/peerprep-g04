import { afterAll, beforeEach, test, expect } from "vitest";
import { create_question, create_question_from_obj, get_question_by_id, pool } from "../database/db";
import request from 'supertest';
import { app } from "../app";

beforeEach(async () => {
    await pool.query(`DELETE FROM questions`);
})

afterAll(async () => {
    await pool.query(`DELETE FROM questions`);
})

test('delete question successful', async () => {
    const q1 = {
        title: 't1',
        difficulty: 'medium',
        tags: ['pq', 'dp'],
        body: 'hello world',
    };

    const id = await create_question_from_obj(q1);

    const res = await request(app).delete(`/delete-question/${id}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
    const q = await get_question_by_id(id);
    expect(q).toBeUndefined();
});