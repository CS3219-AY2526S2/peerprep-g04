import { ACCESS } from "../access";
import { get_all_users, get_user_by_id } from "../database/db";

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

export async function handle_get_user_by_id(req, res) {
    if (!req.access || req.access !== ACCESS.admin) {
        return res.status(403).json({ message: 'user is not admin, not allowed to view users data' });
    }

    const id = req.params.id;
    if (!id) {
        return res.status(400).json({ message: 'user id is missing from url' });
    }

    try {
        const user = await get_user_by_id(id); 
        return res.status(200).json({ message: 'user successfully retrieved by id', user });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}