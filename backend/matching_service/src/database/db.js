import { createClient } from "redis";
import { Pool } from "pg";

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

const QUEUE_TIMEOUT_SECONDS = parseInt(process.env.QUEUE_TIMEOUT_SECONDS || "30");

function queue_key(topic, difficulty) {
    return `queue:${topic}:${difficulty}`;
}

function user_queue_key(user_id) {
    return `user_queue:${user_id}`;
}

export async function enqueue_user(user_id, topic, difficulty) {
    const key = queue_key(topic, difficulty);
    const userKey = user_queue_key(user_id);
    const score = Date.now();

    await redis.zAdd(key, { score, value: String(user_id) });
    await redis.set(userKey, JSON.stringify({ topic, difficulty }), {
        EX: QUEUE_TIMEOUT_SECONDS,
    });
}

export async function dequeue_user(user_id) {
    const userKey = user_queue_key(user_id);
    const raw = await redis.get(userKey);
    if (!raw) return false;

    const { topic, difficulty } = JSON.parse(raw);
    await redis.zRem(queue_key(topic, difficulty), String(user_id));
    await redis.del(userKey);
    return true;
}

export async function is_user_in_queue(user_id) {
    const raw = await redis.get(user_queue_key(user_id));
    return raw !== null;
}

// returns { matched: true, opponent_id } or { matched: false }
export async function try_match(user_id, topic, difficulty) {
    const key = queue_key(topic, difficulty);
    const entries = await redis.zRange(key, 0, 1);

    if (entries.length < 2 || !entries.includes(String(user_id))) {
        return { matched: false };
    }

    const opponent_id = parseInt(entries.find((id) => id !== String(user_id)));

    await redis.zRem(key, String(user_id));
    await redis.zRem(key, String(opponent_id));
    await redis.del(user_queue_key(user_id));
    await redis.del(user_queue_key(opponent_id));

    return { matched: true, opponent_id };
}

export async function save_match(user1_id, user2_id, topic, difficulty, question_id = null) {
    const result = await pool.query(
        `INSERT INTO matches (user1_id, user2_id, topic, difficulty, question_id)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [user1_id, user2_id, topic, difficulty, question_id]
    );
    return result.rows[0].id;
}