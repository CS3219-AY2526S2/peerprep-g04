import { get_user_by_email } from "../database/db.js";
import { compare_password, format_user } from "./utils.js";
import jwt from 'jsonwebtoken';

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