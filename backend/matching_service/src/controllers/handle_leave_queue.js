import { dequeue_user } from "../database/db.js";

export async function handle_leave_queue(req, res) {
    const user_id = req.user_id;

    try {
        const removed = await dequeue_user(user_id);
        if (!removed) {
            return res.status(404).json({ message: 'user is not currently in any queue' });
        }
        return res.status(200).json({ message: 'user removed from queue' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}