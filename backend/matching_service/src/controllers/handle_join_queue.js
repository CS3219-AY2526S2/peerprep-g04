import { enqueue_user } from "../database/db.js";

const VALID_DIFFICULTIES = ["easy", "medium", "hard"];

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
        return res.status(200).json({ message: 'user added to queue', topic, difficulty });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}