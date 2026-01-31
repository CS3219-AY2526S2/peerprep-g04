import { get_user_by_username, get_user_by_email, create_user } from "../database/db.js";
import jwt from 'jsonwebtoken';
import { format_user, hash_password } from "./utils";
import { ACCESS } from "../access.js";

export async function handle_create_user(req, res) {
    try {
        const { username, email, password } = req.body;
        
        if (!(username && email && password)) {
            return res.status(400).json({ message: 'username and/or email and/or password are missing' })
        }

        let existing_user = await get_user_by_username(username) 
        if (existing_user) {
            return res.status(409).json({ message: 'username is taken already' });
        }

        existing_user = await get_user_by_email(email);
        if (existing_user) {
            return res.status(409).json({ message: 'email is taken already '});
        }

        const new_user = await create_user(username, email, hash_password(password), ACCESS.user);
        const access_token = jwt.sign(
            { user_id: new_user.id }, 
            process.env.JWT_SECRET_KEY,
            { expiresIn: '1d'}
        );
        return res.status(201).json({
            message: 'user created successfully',
            access_token,
            ...format_user(new_user),
        })
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}