import { get_match_by_user_id } from "../database/db.js";

export async function handle_my_match(req, res) {
    const user_id = req.user_id;

    try {
        const match = await get_match_by_user_id(user_id);
        if (!match) {
            return res.status(404).json({ message: 'no match found for this user' });
        }
        return res.status(200).json({ message: 'match found', ...match });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}