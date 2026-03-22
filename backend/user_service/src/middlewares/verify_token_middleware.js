import jwt from 'jsonwebtoken';
import { get_user_by_id } from '../database/db.js';

// check whether token is valid and user_id exists.
// attaches user to req if token is valid and user_id exists.
export async function verify_token_middleware(req, res, next) {
    const auth_header = req.headers['authorization'];
    if (!auth_header || !auth_header.startsWith('Bearer ')) {
        return res.status(400).json({ message: 'missing token' });
    }
    const access_token = auth_header.split(' ')[1];
    let payload;
    try {
        payload = jwt.verify(access_token, process.env.JWT_SECRET_KEY);
    } catch (err) {
        return res.status(401).json({ message: 'invalid token'});
    }

    const { user_id, access } = payload;
    if (!user_id) {
        return res.status(400).json({ message: 'user id is missing' });
    }

    try {
        const user = await get_user_by_id(user_id);
        if (!user) {
            return res.status(404).json({ message: 'user in access token not found' });
        } else {
            req.user = user;
            req.access = access;
            next();
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}