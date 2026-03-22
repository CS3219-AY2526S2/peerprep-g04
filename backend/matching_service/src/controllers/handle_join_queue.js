import { enqueue_user, dequeue_user, try_match, save_match } from "../database/db.js";
import { notify_timeout, notify_match, user_id_to_username } from "../websocket.js";

const VALID_DIFFICULTIES = ["easy", "medium", "hard"];
const QUEUE_TIMEOUT_MS = parseInt(process.env.QUEUE_TIMEOUT_SECONDS || "30") * 1000;

export async function handle_join_queue(req, res) {
    const { topics, difficulties } = req.body;
    const user_id = req.user_id;

    if (!topics || !difficulties || !Array.isArray(topics) || !Array.isArray(difficulties)) {
        return res.status(400).json({ message: 'topics and difficulties must be arrays' });
    }

    if (topics.length === 0 || difficulties.length === 0) {
        return res.status(400).json({ message: 'topics and difficulties must not be empty' });
    }

    if (!difficulties.every(d => VALID_DIFFICULTIES.includes(d))) {
        return res.status(400).json({ message: `difficulties must be one of: ${VALID_DIFFICULTIES.join(", ")}` });
    }

    try {
        await enqueue_user(user_id, topics, difficulties);

        const result = await try_match(user_id, topics, difficulties);

        if (result.matched) {
            const match_id = await save_match(user_id, result.opponent_id, result.common_topics, result.common_difficulties);
            notify_match(user_id, result.opponent_id, result.common_topics, result.common_difficulties, match_id, result.question);
            return res.status(200).json({
                message: 'match found',
                match_id,
                opponent_id: result.opponent_id,
                opponent_username: user_id_to_username.get(result.opponent_id),
                topics: result.common_topics,
                difficulties: result.common_difficulties,
                question_id: result.question_id,
            });
        }

        setTimeout(async () => {
            const removed = await dequeue_user(user_id);
            if (removed) {
                notify_timeout(user_id);
            }
        }, QUEUE_TIMEOUT_MS);

        return res.status(200).json({ message: 'user added to queue', topics, difficulties });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}