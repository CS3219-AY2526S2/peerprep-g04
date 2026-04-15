import jwt from 'jsonwebtoken';
import { redis } from '../database/db.js';

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
        return res.status(401).json({ message: 'invalid token' });
    }

    const { user_id, access, iat } = payload;
    if (!user_id) {
        return res.status(400).json({ message: 'user id is missing' });
    }

    try {
        const invalidationTime = await redis.get(`user_invalidated:${user_id}`);
        
        if (invalidationTime) {
            if (iat < parseInt(invalidationTime)) {
                return res.status(401).json({ message: 'Permissions have been updated. Please log in again.' });
            }
        }
    } catch (redisErr) {
        console.error("Redis auth check failed:", redisErr);
        return res.status(500).json({ message: 'Internal server error during authentication' }); 
    }

    if (access !== 'admin' && access !== 'owner') {
        return res.status(403).json({ message: 'this operation is not permitted as user is not an admin' });
    }

    req.user_id = user_id;
    next();
}