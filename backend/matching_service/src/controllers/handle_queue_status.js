import { is_user_in_queue } from "../database/db.js";

export async function handle_queue_status(req, res) {
    const user_id = req.user_id;

    try {
        const in_queue = await is_user_in_queue(user_id);
        return res.status(200).json({ in_queue });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}