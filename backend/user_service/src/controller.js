import { ACCESS } from "./access.js";
import { get_user_by_email, get_user_by_username } from "./db.js";
import { create_user } from "./db.js";
import jwt from 'jsonwebtoken';

function hash_password(password) {
    return password;
}

function compare_password(password, password_hash) {
    return hash_password(password) === password_hash;
}

function format_user(user) {
    return {
        username: user.username,
        email: user.email,
        access: user.access,
    }
}

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

        const new_user = await create_user(username, email, password, ACCESS.user);
        const token = jwt.sign(new_user.id, process.env.JWT_SECRET_KEY);
        return res.status(201).json({
            message: 'user created successfully',
            token,
            ...format_user(new_user),
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message,
        });
    }
}

export async function handle_login(req, res) {
    try {
        const { email, password } = req.body;
        
        if (!(email && password)) {
            return res.status(400).json({ message: 'missing email and/or password' });
        }

        const user = await get_user_by_email(email);
        if (!user) {
            return res.status(404).json({ message: 'email not found' });
        }

        if (!compare_password(password, user.password_hash)) {
            return res.status(401).json({ message: 'wrong password' });
        }

        const token = jwt.sign(user.id, process.env.JWT_SECRET_KEY);
        return res.status(200).json({
            message: 'user logged in',
            token,
            ...format_user(user),
        })
        
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

}