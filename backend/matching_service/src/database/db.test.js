import { test, expect, afterAll } from 'vitest';
import { pool, redis } from './db';

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