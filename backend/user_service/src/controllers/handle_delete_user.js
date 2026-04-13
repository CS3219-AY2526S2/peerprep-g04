import { ACCESS } from "../access.js";
import { delete_user, get_user_by_id } from "../database/db.js";

export async function handle_delete_user(req, res) {
    let user_id_to_del = req.params.userId;
    
    if (!user_id_to_del) {
        return res.status(400).json({ message: 'user id is missing from url' });
    }

    if (isNaN(user_id_to_del = parseInt(user_id_to_del, 10))) {
        return res.status(400).json({ message: 'user id is not a number' });
    }
    
    let user_to_del;
    try {
        user_to_del = await get_user_by_id(user_id_to_del);
        
        if (!user_to_del) {
            return res.status(404).json({ message: 'user requested does not exist' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

    if (req.user.access === ACCESS.user && req.user.id !== user_to_del.id) {
        return res.status(403).json({ message: 'user cannot delete other user accounts' });
    }

    if (req.user.access === ACCESS.admin && user_to_del.access !== ACCESS.user) {
        return res.status(403).json(
            { message: 'admin cannot delete admin or owner account, can only delete user account' }
        );
    }

    // the owner delete check is a database trigger.

    try {
        await delete_user(user_to_del.id);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

    return res.status(200).json({ message: 'user successfully deleted' });
} 