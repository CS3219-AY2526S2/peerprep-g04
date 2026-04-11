import { Pool } from 'pg';

export const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE,
});

export async function get_submissions_by_question(question_id, user_id) {
    const res = await pool.query(`
        SELECT * FROM submission_attempts
        WHERE question_id = $1 AND user_id = $2
        ORDER BY submitted_at DESC
    `, [question_id, user_id]);
    return res.rows;
}

export async function create_submission(user_id, question_id, lang, code, status) {
    const res = await pool.query(`
        INSERT INTO submission_attempts (user_id, question_id, lang, code, status, submitted_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        RETURNING *
    `, [user_id, question_id, lang, code, status]);
    return res.rows[0];
}
