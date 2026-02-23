import { afterAll, beforeEach, test, expect } from "vitest";
import { pool, create_question_from_obj} from "../database/db.js";
import request from 'supertest';
import { app } from "../app.js";

beforeEach(async () => {
    await pool.query(`DELETE FROM questions`);
})

afterAll(async () => {
    await pool.query(`DELETE FROM questions`);
})

test('get all tags successful', async () => {
    const q1 = {
        title: 't1',
        difficulty: 'medium',
        tags: ['pq', 'dp'],
        body: 'hello world',
    }

    const q2 = {
        title: 't2',
        difficulty: 'hard',
        tags: ['pq', 'heap'],
        body: 'hello world',
    }

    await create_question_from_obj(q1);
    await create_question_from_obj(q2);

    const res = await request(app).get('/get-all-tags');
    expect(res.body).toHaveProperty('tags');
    expect(new Set(res.body.tags)).toEqual(new Set(['pq', 'heap', 'dp']));


})