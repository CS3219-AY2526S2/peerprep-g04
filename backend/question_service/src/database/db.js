import { Pool } from 'pg';

export const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE,
});

// returns { title, difficulty, tags, body } or undefined if no question is found
export async function get_question_by_id(id) {
    const result = await pool.query(
        `
        SELECT 
            q.title, 
            q.difficulty, 
            q.body,
            COALESCE(ARRAY_AGG(qt.tag) FILTER (WHERE qt.tag IS NOT NULL), '{}') as tags
        FROM questions q
        LEFT JOIN question_tag qt on q.id = qt.question_id
        WHERE q.id = $1
        GROUP BY q.id
        `
        , [id]);

    return result.rows[0];
}

// returns the id of the newly inserted question
export async function create_question(title, difficulty, tags, body) {
    const result = await pool.query(
        `INSERT INTO questions (title, difficulty, body) VALUES ($1, $2, $3) RETURNING id`
        ,[title, difficulty, body]);

    const id = result.rows[0].id;

    await pool.query(
        `
        INSERT INTO question_tag (question_id, tag)
        SELECT $1, unnest($2::TEXT[])
        ` 
        , [id, tags]);

    return id;
}

export async function delete_question(id) {
    await pool.query(`DELETE FROM questions WHERE id = $1`, [id]);
}

