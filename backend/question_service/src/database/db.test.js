import { test, expect, beforeEach, afterEach, afterAll } from 'vitest';
import { create_question, get_question_by_id, pool } from './db';

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