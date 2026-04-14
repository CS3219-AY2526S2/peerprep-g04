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

export async function get_user_stats(user_id) {
    const totals_res = await pool.query(`
        SELECT
            COUNT(*)::int AS total_submissions,
            COUNT(*) FILTER (WHERE status = 'Accepted')::int AS accepted_count,
            COUNT(DISTINCT question_id)::int AS questions_attempted,
            COUNT(DISTINCT question_id) FILTER (WHERE status = 'Accepted')::int AS questions_solved
        FROM submission_attempts
        WHERE user_id = $1
    `, [user_id]);

    const { total_submissions, accepted_count, questions_attempted, questions_solved } = totals_res.rows[0];
    const acceptance_rate = total_submissions > 0
        ? Math.round((accepted_count / total_submissions) * 100)
        : 0;

    const lang_res = await pool.query(`
        SELECT lang, COUNT(*)::int AS count
        FROM submission_attempts
        WHERE user_id = $1
        GROUP BY lang
        ORDER BY count DESC
    `, [user_id]);

    const languages_used = {};
    for (const row of lang_res.rows) {
        languages_used[row.lang] = row.count;
    }

    const recent_res = await pool.query(`
        SELECT submitted_at, question_id, lang, status
        FROM submission_attempts
        WHERE user_id = $1
        ORDER BY submitted_at DESC
        LIMIT 10
    `, [user_id]);

    const activity_res = await pool.query(`
        SELECT DATE(submitted_at)::text AS date, COUNT(*)::int AS count
        FROM submission_attempts
        WHERE user_id = $1
          AND submitted_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(submitted_at)
        ORDER BY date ASC
    `, [user_id]);

    return {
        total_submissions,
        accepted_count,
        acceptance_rate,
        questions_attempted,
        questions_solved,
        languages_used,
        recent_submissions: recent_res.rows,
        activity: activity_res.rows,
    };
}
