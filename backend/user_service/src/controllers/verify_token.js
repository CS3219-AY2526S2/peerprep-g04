import { format_user } from "./utils.js";
import jwt from 'jsonwebtoken';

// must be called after verify_token_middleware
export async function verify_token(req, res) {
    // may have to update the access token because of user updates.
    const new_access_token = jwt.sign(
        {user_id: req.user.id, access: req.user.access},
        process.env.JWT_SECRET_KEY,
        { expiresIn: '1d'}
    );
    
    return res.status(200).json({ 
        message: 'access token verified',
        ...format_user(req.user),
        access_token: new_access_token,
    })
}