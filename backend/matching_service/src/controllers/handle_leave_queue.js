import { dequeue_user, get_match_by_user_id, get_user_state, states } from "../database/db.js";
import { notify_opponent_left } from "../websocket.js";

export async function handle_leave_queue(req, res) {
    const user_id = req.user_id;

    try {
        // notify opponent only if user is currently matched 
        const current_state = await get_user_state(user_id);
        const match = current_state === states.matched ? await get_match_by_user_id(user_id) : null;
        if (match) {
            const opponent_id = match.user1_id === user_id ? match.user2_id : match.user1_id;
            notify_opponent_left(opponent_id, user_id);
        }

        const removed = await dequeue_user(user_id);
        if (!removed && !match) {
            return res.status(404).json({ message: 'user is not currently in any queue' });
        }

        return res.status(200).json({ message: 'user removed from queue' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}