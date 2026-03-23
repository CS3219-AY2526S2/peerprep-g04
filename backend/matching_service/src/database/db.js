import { createClient } from "redis";
import { Pool } from "pg";
import axios from 'axios';

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

export const states = Object.freeze({matching: 'matching', matched:  'matched'});

const question_api = axios.create({
  baseURL: process.env.QUESTION_SERVICE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


function user_queue_key(user_id) {
    return `user_queue:${user_id}`;
}

function user_state_key(user_id) {
    return `user_state:${user_id}`;
}

function get_intersection(arr1, arr2) {
    const set1 = new Set(arr1);
    return arr2.filter(x => set1.has(x));
}

// mocked function, to integrate with question service.
async function get_question_id(topics, difficulties) {
    try {
        const res = await question_api.post('/get-question-for-match', { difficulties, tags: topics });
        const question = res.data;
        return question.id;
    } catch (err) {
        console.log('get question from question service failed');
        return -1;
    }
}

export async function enqueue_user(user_id, topics, difficulties) {
    const userKey = user_queue_key(user_id);
    const score = Date.now();
    const value = JSON.stringify({ user_id, topics, difficulties });
    const userStateKey = user_state_key(user_id);

    await redis.zAdd(QUEUE_KEY, { score, value });
    await redis.set(userKey, value, { EX: QUEUE_TIMEOUT_SECONDS });
    await redis.set(userStateKey, states.matching);
}
// only modify state if the user is matching.
export async function dequeue_user(user_id) {
    const userKey = user_queue_key(user_id);
    const userStateKey = user_state_key(user_id);
    
    const raw = await redis.get(userKey);
    if (!raw) return false;

    const state = await redis.get(userStateKey);
    if (state !== states.matching) return false;

    const entries = await redis.zRange(QUEUE_KEY, 0, -1);
    for (const entry of entries) {
        const data = JSON.parse(entry);
        if (data.user_id === user_id) {
            await redis.zRem(QUEUE_KEY, entry);
            break;
        }
    }

    await redis.del(userKey);
    await redis.del(userStateKey);
    return true;
}

export async function is_user_in_queue(user_id) {
    const raw = await redis.get(user_queue_key(user_id));
    return raw !== null;
}

// returns { matched: true, opponent_id, common_topics, common_difficulties, room_id } or { matched: false }
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
            
            await redis.set(user_state_key(user_id), states.matched);
            await redis.set(user_state_key(data.user_id), states.matched);
            
            const question_id = await get_question_id(common_topics, common_difficulties);

            return {
                matched: true,
                opponent_id: data.user_id,
                common_topics,
                common_difficulties,
                question_id,
            };
        }
    }

    return { matched: false };
}

export async function get_user_state(user_id) {
    return await redis.get(user_state_key(user_id));
}

// if user is queuing, remove the user from the queue and also his state.
// if user is matched, remove the state.
export async function leave(user_id) {
    const userStateKey = user_state_key(user_id);
    // doesn't matter if user is inside queue or is matched or not either of these 2.
    await dequeue_user(user_id);
    await redis.del(userStateKey);
}

export async function save_match(user1_id, user2_id, topics, difficulties, question_id) {
    const res = await pool.query(
        `INSERT INTO matches (user1_id, user2_id, question_id) VALUES ($1, $2, $3) RETURNING *`, 
        [user1_id, user2_id, question_id]
    );

    const match_id = res.rows[0].id

    await pool.query(`INSERT INTO difficulties SELECT $1, UNNEST($2::TEXT[])`, [match_id, difficulties]);

    await pool.query(`INSERT INTO topics SELECT $1, UNNEST($2::TEXT[])`, [match_id, topics]);

    return res.rows[0].id
}

export async function get_match_by_user_id(user_id) {
    const result = await pool.query(
        `
        SELECT 
            m.*,
            COALESCE(array_agg(DISTINCT d.difficulty) FILTER (WHERE d.difficulty IS NOT NULL), '{}') AS difficulties,
            COALESCE(array_agg(DISTINCT t.topic) FILTER (WHERE t.topic IS NOT NULL), '{}') AS topics
        FROM matches m
        LEFT JOIN difficulties d on m.id = d.match_id
        LEFT JOIN topics t on m.id = t.match_id
        WHERE m.user1_id = $1 OR m.user2_id = $1
        GROUP BY m.id
        ORDER BY m.created_at DESC
        LIMIT 1

        `
    , [user_id]);

    return result.rows[0];
}