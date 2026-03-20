import { Pool } from 'pg';

export const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE,
});

export async function get_user_by_id(user_id) {
    const res = await pool.query('SELECT * FROM users WHERE id = $1', [user_id]);
    return res.rows[0];
}

export async function get_user_by_username(username) {
    const res = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    return res.rows[0];
}

export async function get_user_by_email(email) {
    const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return res.rows[0];
}

export async function get_user_by_username_or_email(username, email) {
    const res = await pool.query(`
        SELECT * FROM users
        WHERE username = $1 OR email = $2
    `, [username, email]);
    return res.rows;
}

export async function get_all_users() {
    const res = await pool.query(`SELECT * FROM users`);
    return res.rows;
}

export async function create_user(username, email, password_hash, access) {
    const res = await pool.query(
        'INSERT INTO USERS (username, email, password_hash, access) VALUES ($1, $2, $3, $4) RETURNING *',
        [username, email, password_hash, access]);
    return res.rows[0];
}

export async function update_user(id, username, email, password_hash) {
    const res = await pool.query(`
        UPDATE users 
        SET username = $1,
            email = $2,
            password_hash = $3
        WHERE id = $4
        RETURNING *;
    `, [username, email, password_hash, id]);
    return res.rows[0];
}

export async function delete_user(id) {
    await pool.query(`
        DELETE FROM users
        WHERE id = $1
    `, [id]);
}