import { test, expect, beforeEach, afterEach, afterAll } from 'vitest';
import { create_question, create_question_from_obj, get_all_questions_without_body, get_all_tags, get_question_by_id, get_question_by_title, get_question_for_match, pool, update_question } from './db';

beforeEach(async () => {
    await pool.query(`
        DELETE FROM questions;
    `);
});

afterAll(async () => {
    await pool.query(`
        DELETE FROM questions;
    `);
});

test('create and get question', async () => {
    const question = {
        title: 'Two Sum',
        difficulty: 'easy',
        tags: ['array', 'dp'],
        body: 'hello world',
    };

    const id = await create_question(question.title, question.difficulty, question.tags, question.body);

    const result = await get_question_by_id(id);
    expect(result).toMatchObject(question);
});

test('get question by title', async () => {
    const question = {
        title: 'Two Sum',
        difficulty: 'easy',
        tags: ['array', 'dp'],
        body: 'hello world',
    };

    await create_question(question.title, question.difficulty, question.tags, question.body);

    const result = await get_question_by_title(question.title);
    expect(result).toMatchObject(question);
})

test('create question with no tags', async () => {
    const question = {
        title: 'Two Sum',
        difficulty: 'easy',
        tags: [],
        body: 'hello world',
    };

    const id = await create_question(question.title, question.difficulty, question.tags, question.body);

    const result = await get_question_by_id(id);
    expect(result).toMatchObject(question);
})

test('get non-existant question', async () => {
    const result = await get_question_by_id(6969);
    expect(result).toBeUndefined();
})

test('get all questions', async () => {
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
    
    const result = await get_all_questions_without_body();
    expect(result).toHaveLength(2);
    
    delete q1.body;
    delete q2.body;
    expect(result).toMatchObject([q1, q2]);
})

test('update question', async () => {
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

    const id = await create_question_from_obj(q1);
    await update_question(id, q2);
    const question = await get_question_by_id(id);
    
    q2.tags.sort();
    question.tags.sort();
    expect(question).toMatchObject(q2);
})

test('get question for match', async () => {
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
        difficulty_lst: ['easy', 'medium'],
        tags: ['dp', 'segment tree'],
    }

    const req2 = {
        difficulty_lst: ['hard'],
        tags: ['pq'],
    }

    const id1 = await create_question_from_obj(q1);
    const id2 = await create_question_from_obj(q2);
    
    const res = await get_question_for_match(req.difficulty_lst, req.tags);
    expect(res).toMatchObject(q1);
    expect(res.id).toBe(id1);

    const res2 = await get_question_for_match(req2.difficulty_lst, req2.tags);
    expect(res2).toMatchObject(q2);
    expect(res2.id).toBe(id2);
})

test('get all tags', async () => {
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

    const res = await get_all_tags();
    expect(new Set(res)).toEqual(new Set(['pq', 'heap', 'dp']));

})