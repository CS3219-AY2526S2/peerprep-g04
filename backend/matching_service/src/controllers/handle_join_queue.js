import { enqueue_user, dequeue_user, try_match, save_match } from "../database/db.js";
import { notify_timeout, notify_match } from "../websocket.js";
import axios from "axios";

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


            const match_id = await save_match(user_id, result.opponent_id, result.common_topics[0], result.common_difficulties[0]);

            // send message to collaboration service to create session

            try {            
            const QUESTIONS_SERVICE_URL = process.env.QUESTIONS_SERVICE_URL || "http://localhost:8081";
            const question_res = await axios.post(`${QUESTIONS_SERVICE_URL}/api/questions/for-match`, {
                    tags: result.common_topics,
                    difficulties: result.common_difficulties
            });

            const q = question_res.data;

            const COLLAB_SERVICE_URL = process.env.COLLAB_SERVICE_URL || "http://localhost:8080";
            await axios.post(`${COLLAB_SERVICE_URL}/collab/start`, {
            sessionId: match_id.toString(),
            userA: user_id.toString(),
            userB: result.opponent_id.toString(),
            questionId: q.id.toString(),
            title: q.title,
            difficulty: q.difficulty,
            body: q.body
            });} catch (err) {
                console.error("Error communicating with other services:", err.message);
            }

            notify_match(user_id, result.opponent_id, result.common_topics, result.common_difficulties);
            return res.status(200).json({
                message: 'match found',
                match_id,
                opponent_id: result.opponent_id,
                topics: result.common_topics,
                difficulties: result.common_difficulties,
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