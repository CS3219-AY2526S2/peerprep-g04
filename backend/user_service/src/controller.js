import { ACCESS } from "./access.js";
import { get_user_by_email, get_user_by_id, get_user_by_username } from "./db.js";
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
        const access_token = jwt.sign(new_user.id, process.env.JWT_SECRET_KEY);
        return res.status(201).json({
            message: 'user created successfully',
            access_token,
            ...format_user(new_user),
        })
    } catch (err) {
        return res.status(500).json({ message: err.message });
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

        const access_token = jwt.sign(
            { user_id: user.id }, 
            process.env.JWT_SECRET_KEY,
            { expiresIn: '1d'}
        );
        
        return res.status(200).json({
            message: 'user logged in',
            access_token,
            ...format_user(user),
        })
        
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

export async function verify_token(req, res) {
    const auth_header = req.headers['authorization'];
    if (!auth_header || !auth_header.startsWith('Bearer ')) {
        return res.status(400).json({ message: 'missing token' });
    }

    const access_token = auth_header.split(' ')[1];
    try {
        jwt.verify(access_token, process.env.JWT_SECRET_KEY);
    } catch (err) {
        return res.status(401).json({ message: 'invalid token'});
    }

    const { user_id } = jwt.verify(access_token, process.env.JWT_SECRET_KEY);
    if (!user_id) {
        return res.status(400).json({ message: 'user id is missing' });
    }

    try {
        const user = await get_user_by_id(user_id);
        if (!user) {
            return res.status(404).json({ message: 'user not found' });
        } else {
            return res.status(200).json({ 
                message: 'access token verified',
                ...format_user(user),
            });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}