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

const QUEUE_KEY = "matching_queue";

function user_queue_key(user_id) {
    return `user_queue:${user_id}`;
}

function get_intersection(arr1, arr2) {
    const set1 = new Set(arr1);
    return arr2.filter(x => set1.has(x));
}

export async function enqueue_user(user_id, topics, difficulties) {
    const userKey = user_queue_key(user_id);
    const score = Date.now();
    const value = JSON.stringify({ user_id, topics, difficulties });

    await redis.zAdd(QUEUE_KEY, { score, value });
    await redis.set(userKey, value, { EX: QUEUE_TIMEOUT_SECONDS });
}

export async function dequeue_user(user_id) {
    const userKey = user_queue_key(user_id);
    const raw = await redis.get(userKey);
    if (!raw) return false;

    const entries = await redis.zRange(QUEUE_KEY, 0, -1);
    for (const entry of entries) {
        const data = JSON.parse(entry);
        if (data.user_id === user_id) {
            await redis.zRem(QUEUE_KEY, entry);
            break;
        }
    }

    await redis.del(userKey);
    return true;
}

export async function is_user_in_queue(user_id) {
    const raw = await redis.get(user_queue_key(user_id));
    return raw !== null;
}

// returns { matched: true, opponent_id, common_topics, common_difficulties } or { matched: false }
export async function try_match(user_id, topics, difficulties) {
    const entries = await redis.zRange(QUEUE_KEY, 0, -1);

    for (const entry of entries) {
        const data = JSON.parse(entry);
        if (data.user_id === user_id) continue;

        const common_topics = get_intersection(topics, data.topics);
        const common_difficulties = get_intersection(difficulties, data.difficulties);

        if (common_topics.length > 0 && common_difficulties.length > 0) {
            const my_entry = entries.find(e => JSON.parse(e).user_id === user_id);
            await redis.zRem(QUEUE_KEY, entry);
            if (my_entry) await redis.zRem(QUEUE_KEY, my_entry);
            await redis.del(user_queue_key(user_id));
            await redis.del(user_queue_key(data.user_id));

            return {
                matched: true,
                opponent_id: data.user_id,
                common_topics,
                common_difficulties,
            };
        }
    }

    return { matched: false };
}

export async function save_match(user1_id, user2_id, topic, difficulty, question_id = null) {
    const result = await pool.query(
        `INSERT INTO matches (user1_id, user2_id, topic, difficulty, question_id)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [user1_id, user2_id, topic, difficulty, question_id]
    );
    return result.rows[0].id;
}

export async function get_match_by_user_id(user_id) {
    const result = await pool.query(
        `SELECT * FROM matches WHERE user1_id = $1 OR user2_id = $1 ORDER BY created_at DESC LIMIT 1`,
        [user_id]
    );
    return result.rows[0];
}