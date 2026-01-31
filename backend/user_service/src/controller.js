import { ACCESS } from "./access.js";
import { get_user_by_email, get_user_by_id, get_user_by_username, update_user } from "./db.js";
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
        user_id: user.id,
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
            { expiresIn: '1d'},
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

// must be called after verify_token_middleware
export async function verify_token(req, res) {
    return res.status(200).json({ 
        message: 'access token verified',
        ...format_user(req.user),
    })
}

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


