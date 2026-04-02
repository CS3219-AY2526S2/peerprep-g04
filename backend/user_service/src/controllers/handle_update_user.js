import { ACCESS } from "../access.js";
import { get_user_by_email, get_user_by_id, get_user_by_username, update_user } from "../database/db.js";
import { format_user } from "./utils.js";
import { hash_password } from "./utils.js";

export async function handle_update_user(req, res) {
    let user_id_to_update = req.params.userId;
    if (!user_id_to_update) {
        return res.status(400).json({ message: 'user id is missing from url'});
    }

    if (isNaN(user_id_to_update = parseInt(user_id_to_update, 10))) {
        return res.status(400).json({ message: 'user id is not a number'});
    }

    let { username, email, password, access } = req.body;
    if (!(username || email || password || access)) {
        return res.status(400).json({ message: 'username and email and password and access are missing' });
    }

    let user_to_update;
    try {
        user_to_update = await get_user_by_id(user_id_to_update);
        if (!user_to_update) {
            res.status(404).json({ message: 'user id requested does not exist'});
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }

    username = username || user_to_update.username;
    email = email || user_to_update.email;
    let password_hash = (password && hash_password(password)) || user_to_update.password_hash;
    access = access || user_to_update.access;

    if (req.user.access !== ACCESS.admin && req.user.access !== ACCESS.owner && req.user.id !== user_id_to_update) {
        return res.status(403).json({ message: 'user is not admin, cannot update other users'});
    }

    if (user_to_update.access === ACCESS.owner && req.user.access !== ACCESS.owner) {
        return res.status(403).json({ message: 'only owner can update owner'});
    }

    // Admin cannot demote other admins
    if (
        req.user.access === ACCESS.admin &&
        user_to_update.access === ACCESS.admin &&
        access === ACCESS.user
    ) {
        return res.status(403).json({
            message: 'admin cannot demote another admin'
        });
    }

    try {
        const check1 = await get_user_by_username(username);
        if (check1 && check1.id !== user_id_to_update) {
            return res.status(409).json({ message: 'new username is taken'});
        }

        const check2 = await get_user_by_email(email);
        if (check2 && check2.id !== user_id_to_update) {
            return res.status(409).json({ message: 'new email is taken'});
        }
        
        const new_user = await update_user(user_id_to_update, username, email, password_hash, access);
        return res.status(200).json({
            message: 'user updated successfully',
            ...format_user(new_user)
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}