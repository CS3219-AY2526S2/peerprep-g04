import jwt from 'jsonwebtoken';

export function verify_token_middleware(req, res, next) {
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

    const { user_id, access } = payload;
    if (!user_id) {
        return res.status(400).json({ message: 'user id is missing' });
    } else if (access !== 'admin') {
        return res.status(400).json({ message: 'this operation is not permitted as user is not an admin' });
    }

    req.user_id = user_id;
    next();
}