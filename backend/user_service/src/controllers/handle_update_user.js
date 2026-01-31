import { ACCESS } from "../access.js";
import { get_user_by_email, get_user_by_username, update_user } from "../database/db.js";
import { format_user } from "./utils.js";

// must be called after verify_token_middleware
export async function handle_update_user(req, res) {
    let user_id = req.params.userId;
    if (!user_id) {
        return res.status(400).json({ message: 'user id is missing from url'});
    }

    if (isNaN(user_id = parseInt(user_id, 10))) {
        return res.status(400).json({ message: 'user id is not a number'});
    }

    let { username, email, password } = req.body;
    if (!(username || email || password)) {
        return res.status(400).json({ message: 'username and email and password are missing' });
    }

    let id = req.user.id;
    username = username || req.user.username;
    email = email || req.user.email;
    let password_hash = (password && hash_password(password)) || req.user.password_hash;
    let access = req.user.access;

    if (access !== ACCESS.admin && id !== user_id) {
        return res.status(403).json({ message: 'user is not admin, cannot update other users'});
    }

    try {
        const check1 = await get_user_by_username(username);
        if (check1 && check1.id !== id) {
            return res.status(409).json({ message: 'new username is taken'});
        }

        const check2 = await get_user_by_email(email);
        if (check2 && check2.id !== id) {
            return res.status(409).json({ message: 'new email is taken'});
        }
        
        const new_user = await update_user(id, username, email, password_hash);
        return res.status(200).json({
            message: 'user updated successfully',
            ...format_user(new_user)
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}