import { test, expect, afterAll, beforeEach } from 'vitest';
import { enqueue_user, get_match_by_user_id, pool, redis, save_match, leave, get_user_state, states, try_match } from './db';

beforeEach(async () => {
    await redis.flushAll();
});

afterAll(async () => {
    await pool.end();
    await redis.disconnect();
});

test('postgres connection is working', async () => {
    const result = await pool.query('SELECT 1+1 AS result');
    expect(result.rows[0].result).toBe(2);
});

test('redis connection is working', async () => {
    await redis.set('test_key', 'test_value');
    const value = await redis.get('test_key');
    expect(value).toBe('test_value');
    await redis.del('test_key');
});

test('insert into matches', async () => {
    await save_match(1, 2, 'array', 'easy', '100');
    const res = await get_match_by_user_id(1);
    expect([1, 2]).toContain(res.user1_id);
});

test('enqueue and leave', async () => {
    const user_id = 1;
    const topics = ['array', 'dp'];
    const difficulties = ['easy', 'medium'];
    
    await enqueue_user(user_id, topics, difficulties);
    const state1 = await get_user_state(user_id);
    expect(state1).toMatch(states.matching);
    
    await leave(user_id);
    const state2 = await get_user_state(user_id);
    expect(state2).toBeNull();
});

test('2 enqueue and match', async () => {
    const user1 = {
        user_id: 1,
        topics: ['array'],
        difficulties: ['easy'],
    }

    const user2 = {
        user_id: 2,
        topics: ['array', 'dp'],
        difficulties: ['easy', 'hard'],
    }

    await enqueue_user(...Object.values(user1));
    await try_match(...Object.values(user2));

    const state1 = await get_user_state(user1.user_id);
    expect(state1).toMatch(states.matched);
    const state2 = await get_user_state(user2.user_id);
    expect(state2).toMatch(states.matched);

    await leave(user2.user_id);
    const state3 = await get_user_state(user2.user_id);
    expect(state3).toBeNull();
})