import { get_match_count_by_user_id } from "../database/db.js";

export async function handle_match_count(req, res) {
    const user_id = req.user_id;
    try {
        const total_matches = await get_match_count_by_user_id(user_id);
        return res.status(200).json({ total_matches });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}
