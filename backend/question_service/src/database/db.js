import { Pool } from 'pg';
import { createClient } from 'redis';

export const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE,
});

export const redis = createClient({ url: process.env.REDIS_URL });
redis.on("error", (err) => console.error("Redis error:", err));
await redis.connect();

// returns { title, difficulty, tags, body, test_case_input, test_case_output } or undefined if no question is found
export async function connectWithRetry() {
  let retries = 5;

  while (retries) {
    try {
      await pool.query("SELECT 1");
      console.log("Qn DB connected");
      return;
    } catch (err) {
      console.log("Qn DB not ready, retrying...");
      retries--;
      await new Promise((res) => setTimeout(res, 2000));
    }
  }

  throw new Error("Could not connect to Question DB");
}

export async function get_question_by_id(id) {
    const result = await pool.query(
        `
        SELECT 
            q.id,
            q.title, 
            q.difficulty, 
            q.body,
            COALESCE(ARRAY_AGG(DISTINCT qt.tag) FILTER (WHERE qt.tag IS NOT NULL), '{}') as tags,
            MAX(tc.input) as test_case_input,
            MAX(tc.expected_output) as test_case_output
        FROM questions q
        LEFT JOIN question_tag qt on q.id = qt.question_id
        LEFT JOIN test_cases tc on q.id = tc.question_id
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

export async function get_any_question() {
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
        GROUP BY q.id
        ORDER BY RANDOM()
        LIMIT 1;
        `
    );
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
    return await create_question(obj.title, obj.difficulty, obj.tags, obj.body, obj.test_case);
}

// returns the id of the newly inserted question
export async function create_question(title, difficulty, tags, body, test_case) {
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
        
    if (test_case && test_case.input && test_case.expected_output) {
        await pool.query(
            `INSERT INTO test_cases (question_id, input, expected_output) VALUES ($1, $2, $3)`,
            [id, test_case.input, test_case.expected_output]
        );
    }

    return id;
}

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

    if (obj.test_case) {
        await client.query(`DELETE FROM test_cases WHERE question_id = $1`, [id]);
        await client.query(
            `INSERT INTO test_cases (question_id, input, expected_output) VALUES ($1, $2, $3)`,
            [id, obj.test_case.input, obj.test_case.expected_output]
        );
    }

    await client.query("COMMIT");   
    client.release(); 
}

export async function delete_question(id) {
    await pool.query(`DELETE FROM questions WHERE id = $1`, [id]);
}
