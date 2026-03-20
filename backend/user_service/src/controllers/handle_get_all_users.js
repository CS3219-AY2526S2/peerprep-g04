import { ACCESS } from "../access";
import { get_all_users } from "../database/db";

export async function handle_get_all_users(req, res) {
    if (!req.access || req.access !== ACCESS.admin) {
        return res.status(403).json({ message: 'user is not admin, not allowed to view users data' });
    }
    
    try {
        const users = await get_all_users();
        return res.status(200).json({ message: 'all users retrieved successfully', users });
    } catch (err) {
        return res.status(500).json({ message: err?.message || 'Internal server error' });
    }
}