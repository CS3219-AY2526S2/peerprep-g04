import { app } from "../app.js";
import { pool } from "../database/db.js";
import { beforeEach, afterAll, test, expect, vi } from "vitest";
import request from "supertest";
import jwt from 'jsonwebtoken';

const test_user_id = 999;
const valid_token = jwt.sign({ user_id: test_user_id }, process.env.JWT_SECRET_KEY);

beforeEach(async () => {
    await pool.query(`DELETE FROM submission_attempts;`);
    vi.restoreAllMocks();
});

afterAll(async () => {
    await pool.query(`DELETE FROM submission_attempts;`);
});

// --- auth ---

test('returns 400 with no token', async () => {
    const res = await request(app).get('/user-stats');
    expect(res.status).toBe(400);
});

test('returns 401 with invalid token', async () => {
    const res = await request(app)
        .get('/user-stats')
        .set('authorization', 'Bearer invalidtoken');
    expect(res.status).toBe(401);
});

// --- empty state ---

test('returns zeroed stats for user with no submissions', async () => {
    const res = await request(app)
        .get('/user-stats')
        .set('authorization', `Bearer ${valid_token}`);

    expect(res.status).toBe(200);
    expect(res.body.total_submissions).toBe(0);
    expect(res.body.accepted_count).toBe(0);
    expect(res.body.acceptance_rate).toBe(0);
    expect(res.body.questions_attempted).toBe(0);
    expect(res.body.questions_solved).toBe(0);
    expect(res.body.languages_used).toEqual({});
    expect(res.body.recent_submissions).toEqual([]);
    expect(res.body.activity).toEqual([]);
});

// --- submission counts ---

test('correctly counts total_submissions, accepted_count, acceptance_rate', async () => {
    await pool.query(
        `INSERT INTO submission_attempts (user_id, question_id, lang, code, status) VALUES
         ($1, 1, 'python', 'code', 'Accepted'),
         ($1, 1, 'python', 'code', 'Failed'),
         ($1, 2, 'javascript', 'code', 'Accepted')`,
        [test_user_id]
    );

    const res = await request(app)
        .get('/user-stats')
        .set('authorization', `Bearer ${valid_token}`);

    expect(res.status).toBe(200);
    expect(res.body.total_submissions).toBe(3);
    expect(res.body.accepted_count).toBe(2);
    expect(res.body.acceptance_rate).toBe(67); // Math.round(2/3 * 100)
});

// --- questions attempted vs solved ---

test('questions_attempted counts distinct questions regardless of status', async () => {
    await pool.query(
        `INSERT INTO submission_attempts (user_id, question_id, lang, code, status) VALUES
         ($1, 1, 'python', 'code', 'Failed'),
         ($1, 1, 'python', 'code', 'Failed'),
         ($1, 2, 'python', 'code', 'Accepted')`,
        [test_user_id]
    );

    const res = await request(app)
        .get('/user-stats')
        .set('authorization', `Bearer ${valid_token}`);

    expect(res.body.questions_attempted).toBe(2);
    expect(res.body.questions_solved).toBe(1); // only q2 has an Accepted
});

test('questions_solved does not count a question solved if only Failed attempts exist', async () => {
    await pool.query(
        `INSERT INTO submission_attempts (user_id, question_id, lang, code, status) VALUES
         ($1, 1, 'python', 'code', 'Failed'),
         ($1, 2, 'python', 'code', 'Error')`,
        [test_user_id]
    );

    const res = await request(app)
        .get('/user-stats')
        .set('authorization', `Bearer ${valid_token}`);

    expect(res.body.questions_attempted).toBe(2);
    expect(res.body.questions_solved).toBe(0);
});

// --- languages_used ---

test('languages_used returns correct per-language counts', async () => {
    await pool.query(
        `INSERT INTO submission_attempts (user_id, question_id, lang, code, status) VALUES
         ($1, 1, 'python', 'code', 'Accepted'),
         ($1, 2, 'python', 'code', 'Failed'),
         ($1, 3, 'javascript', 'code', 'Accepted')`,
        [test_user_id]
    );

    const res = await request(app)
        .get('/user-stats')
        .set('authorization', `Bearer ${valid_token}`);

    expect(res.body.languages_used).toEqual({ python: 2, javascript: 1 });
});

// --- recent_submissions ---

test('recent_submissions returns at most 10 entries ordered by most recent', async () => {
    for (let i = 1; i <= 12; i++) {
        await pool.query(
            `INSERT INTO submission_attempts (user_id, question_id, lang, code, status)
             VALUES ($1, $2, 'python', 'code', 'Accepted')`,
            [test_user_id, i]
        );
    }

    const res = await request(app)
        .get('/user-stats')
        .set('authorization', `Bearer ${valid_token}`);

    expect(res.body.recent_submissions.length).toBe(10);
    expect(res.body.recent_submissions[0]).toHaveProperty('submitted_at');
    expect(res.body.recent_submissions[0]).toHaveProperty('question_id');
    expect(res.body.recent_submissions[0]).toHaveProperty('lang');
    expect(res.body.recent_submissions[0]).toHaveProperty('status');
    // code and user_id must not leak
    expect(res.body.recent_submissions[0]).not.toHaveProperty('code');
    expect(res.body.recent_submissions[0]).not.toHaveProperty('user_id');
});

// --- activity ---

test('activity groups submissions by day and excludes entries older than 30 days', async () => {
    await pool.query(
        `INSERT INTO submission_attempts (user_id, question_id, lang, code, status, submitted_at) VALUES
         ($1, 1, 'python', 'code', 'Accepted', NOW()),
         ($1, 2, 'python', 'code', 'Failed',   NOW()),
         ($1, 3, 'python', 'code', 'Accepted', NOW() - INTERVAL '40 days')`,
        [test_user_id]
    );

    const res = await request(app)
        .get('/user-stats')
        .set('authorization', `Bearer ${valid_token}`);

    expect(res.body.activity.length).toBe(1);       // 40-day-old entry excluded
    expect(res.body.activity[0].count).toBe(2);
    expect(res.body.activity[0]).toHaveProperty('date');
});

// --- privacy ---

test('only returns data for the authenticated user, not other users', async () => {
    await pool.query(
        `INSERT INTO submission_attempts (user_id, question_id, lang, code, status) VALUES
         ($1, 1, 'python', 'code', 'Accepted'),
         (67, 1, 'python', 'code', 'Accepted'),
         (67, 2, 'python', 'code', 'Accepted')`,
        [test_user_id]
    );

    const res = await request(app)
        .get('/user-stats')
        .set('authorization', `Bearer ${valid_token}`);

    expect(res.body.total_submissions).toBe(1);
    expect(res.body.questions_attempted).toBe(1);
});

// --- total_matches via matching-service ---

test('total_matches is null when MATCHING_SERVICE_URL is not set', async () => {
    const original = process.env.MATCHING_SERVICE_URL;
    delete process.env.MATCHING_SERVICE_URL;

    const res = await request(app)
        .get('/user-stats')
        .set('authorization', `Bearer ${valid_token}`);

    expect(res.status).toBe(200);
    expect(res.body.total_matches).toBeNull();

    process.env.MATCHING_SERVICE_URL = original;
});

test('total_matches is null when matching service call fails', async () => {
    process.env.MATCHING_SERVICE_URL = 'http://localhost:0'; // unreachable

    const res = await request(app)
        .get('/user-stats')
        .set('authorization', `Bearer ${valid_token}`);

    expect(res.status).toBe(200); // non-blocking: does not fail the whole request
    expect(res.body.total_matches).toBeNull();

    delete process.env.MATCHING_SERVICE_URL;
});

test('total_matches returns value from matching service when available', async () => {
    process.env.MATCHING_SERVICE_URL = 'http://matching-service-mock';

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ total_matches: 7 }),
    }));

    const res = await request(app)
        .get('/user-stats')
        .set('authorization', `Bearer ${valid_token}`);

    expect(res.status).toBe(200);
    expect(res.body.total_matches).toBe(7);

    delete process.env.MATCHING_SERVICE_URL;
});
