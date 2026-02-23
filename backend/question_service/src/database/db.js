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
            q.id,
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

export async function get_question_by_title(title) {
    const result = await pool.query(
        `
        SELECT 
            q.id,
            q.title, 
            q.difficulty, 
            q.body,
            COALESCE(ARRAY_AGG(qt.tag) FILTER (WHERE qt.tag IS NOT NULL), '{}') as tags
        FROM questions q
        LEFT JOIN question_tag qt on q.id = qt.question_id
        WHERE q.title = $1
        GROUP BY q.id
        `
        , [title]);
    return result.rows[0];
}

export async function get_all_questions_without_body() {
    const result = await pool.query(
        `
        SELECT 
            q.id,
            q.title, 
            q.difficulty, 
            COALESCE(ARRAY_AGG(qt.tag) FILTER (WHERE qt.tag IS NOT NULL), '{}') as tags
        FROM questions q
        LEFT JOIN question_tag qt on q.id = qt.question_id
        GROUP BY q.id
        ORDER BY q.id
        `
        , []);

    return result.rows;
}

export async function get_question_for_match(difficulties, tags) {
    const result = await pool.query(
        `
        SELECT 
            q.id,
            q.title,
            q.difficulty,
            q.body,
            ARRAY_AGG(qt.tag) AS tags
        FROM questions q
        JOIN question_tag qt ON qt.question_id = q.id
        WHERE q.difficulty = ANY($1)
        AND EXISTS (
            SELECT 1
            FROM question_tag qt2
            WHERE qt2.question_id = q.id
                AND qt2.tag = ANY($2)
        )
        GROUP BY q.id
        ORDER BY RANDOM()
        LIMIT 1;
        `, [difficulties, tags]);
    return result.rows[0];
}

export async function get_all_tags() {
    const res = await pool.query(
        `
        SELECT DISTINCT tag from question_tag;
        `
    );
    const arr = res.rows.map(row => row.tag);
    return arr;
}

export async function create_question_from_obj(obj) {
    return await create_question(obj.title, obj.difficulty, obj.tags, obj.body);
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

// obj must have { title, difficulty, tags, body }
export async function update_question(id, obj) {
    const client = await pool.connect();
   
    await client.query("BEGIN");

    await client.query(
        `DELETE FROM question_tag WHERE question_id = $1`,
        [id]
    );

    await client.query(
        `INSERT INTO question_tag (question_id, tag)
            SELECT $1, unnest($2::TEXT[])`,
        [id, obj.tags]
    );

    await client.query(
        `UPDATE questions
            SET title = $1,
                difficulty = $2,
                body = $3
            WHERE id = $4`,
        [obj.title, obj.difficulty, obj.body, id]
    );

    await client.query("COMMIT");   
}
