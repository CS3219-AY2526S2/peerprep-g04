import { enqueue_user, dequeue_user, try_match, save_match } from "../database/db.js";
import { notify_timeout, notify_match } from "../websocket.js";

const VALID_DIFFICULTIES = ["easy", "medium", "hard"];
const QUEUE_TIMEOUT_MS = parseInt(process.env.QUEUE_TIMEOUT_SECONDS || "30") * 1000;

export async function handle_join_queue(req, res) {
    const { topic, difficulty } = req.body;
    const user_id = req.user_id;

    if (!topic || !difficulty) {
        return res.status(400).json({ message: 'topic and difficulty are required' });
    }

    if (!VALID_DIFFICULTIES.includes(difficulty)) {
        return res.status(400).json({ message: `difficulty must be one of: ${VALID_DIFFICULTIES.join(", ")}` });
    }

    try {
        await enqueue_user(user_id, topic, difficulty);

        const result = await try_match(user_id, topic, difficulty);

        if (result.matched) {
            const match_id = await save_match(user_id, result.opponent_id, topic, difficulty);
            notify_match(user_id, result.opponent_id, topic, difficulty);
            return res.status(200).json({
                message: 'match found',
                match_id,
                opponent_id: result.opponent_id,
                topic,
                difficulty,
            });
        }

        setTimeout(async () => {
            const removed = await dequeue_user(user_id);
            if (removed) {
                notify_timeout(user_id);
            }
        }, QUEUE_TIMEOUT_MS);

        return res.status(200).json({ message: 'user added to queue', topic, difficulty });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}