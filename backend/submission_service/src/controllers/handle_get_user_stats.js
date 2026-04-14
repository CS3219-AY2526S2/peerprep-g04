import { get_user_stats } from "../database/db.js";

export async function handle_get_user_stats(req, res) {
    const user_id = req.user_id;

    try {
        const stats = await get_user_stats(user_id);

        let total_matches = null;
        const matching_url = process.env.MATCHING_SERVICE_URL;
        if (matching_url) {
            try {
                const match_res = await fetch(`${matching_url}/match-count`, {
                    headers: { authorization: req.headers['authorization'] },
                });
                if (match_res.ok) {
                    const data = await match_res.json();
                    total_matches = data.total_matches;
                }
            } catch (_) {
                // non-blocking: matching service may be unavailable
            }
        }

        return res.status(200).json({
            message: 'user stats retrieved successfully',
            ...stats,
            total_matches,
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}
