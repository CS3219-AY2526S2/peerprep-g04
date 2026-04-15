import { afterAll, beforeEach, test, expect } from "vitest";
import { create_question_from_obj, pool } from "../database/db.js";
import request from 'supertest';
import { app } from "../app.js";

beforeEach(async () => {
    await pool.query(`DELETE FROM questions`);
})

afterAll(async () => {
    await pool.query(`DELETE FROM questions`);
})

test('get question by id', async () => {
    const q1 = {
        title: 't1',
        difficulty: 'medium',
        tags: ['pq', 'dp'],
        body: 'hello world',
    }
    const id = await create_question_from_obj(q1);
    
    const res = await request(app).get(`/get-question-by-id/${id}`);
    expect(res.status).toBe(200);
    res.body.tags.sort();
    q1.tags.sort();
    expect(res.body).toMatchObject(q1);

    const q2 = {
        title: 't2',
        difficulty: 'hard',
        tags: ['pq', 'heap'],
        body: 'hello world',
    }
    const id2 = await create_question_from_obj(q2);
    
    const res2 = await request(app).get(`/get-question-by-id/${id2}`);
    expect(res2.status).toBe(200);
    res2.body.tags.sort();
    q2.tags.sort();
    expect(res2.body).toMatchObject(q2);
    expect(res.body).toHaveProperty('id');
});

test('get non-existant question id', async () => {
    const res = await request(app).get('/get-question-by-id/6969');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message');
});

test('get all questions without body', async () => {
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
    
    const res = await request(app).get('/get-all-questions-without-body');
    expect(res.body).toHaveProperty('questions');
    delete q1.body;
    delete q2.body;
    expect(res.body.questions).toMatchObject([q1, q2]);
    expect(res.body.questions.filter(q => q.id)).toHaveLength(2);
});

test('get question for match successful', async () => {
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

    const req = {
        difficulties: ['easy', 'hard'],
        tags: ['pq', 'segment tree'],
    }

    const id1 = await create_question_from_obj(q1);
    const id2 = await create_question_from_obj(q2);

    const res = await request(app).post('/get-question-for-match').send(req);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(id2);
    expect(res.body).toMatchObject(q2);
});

test('get question for match no question found', async () => {
    const q1 = {
        title: 't1',
        difficulty: 'medium',
        tags: ['pq', 'dp'],
        body: 'hello world',
    };
    const q2 = {
        title: 't2',
        difficulty: 'hard',
        tags: ['pq', 'heap'],
        body: 'hello world',
    };

    const req = {
        difficulties: ['medium'],
        tags: ['segment tree', 'greedy'],
    };

    const id1 = await create_question_from_obj(q1);
    const id2 = await create_question_from_obj(q2);

    const res = await request(app).post('/get-question-for-match').send(req);
    expect(res.status).toBe(200);

});