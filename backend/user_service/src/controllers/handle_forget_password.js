import { get_user_by_email } from "../database/db.js";
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  }
});

export async function handle_forget_password(req, res) {
    const email = req?.params?.email;
    
    if (!email) {
        return res.status(400).json({ message: 'missing email' });
    }
    
    let user;
    try {
        user = await get_user_by_email(email);
        if (!user) return res.status(404).json({ message: 'email not found' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
   
    const token = jwt.sign({user_id: user.id}, process.env.JWT_SECRET_KEY, {expiresIn: '15m'});
    const resetUrl = `${process.env.WEBSITE_URL}/reset-password/${token}/${user.id}`;

    let mailOptions = {
        from: process.env.GMAIL,
        to: user.email,
        subject: 'PeerPrep Forgot Password',
        html: `
            <h2>Password Reset</h2>
            <p>You requested to reset your password.</p>
            <p>
                Click the link below to reset it:
            </p>
            <a href="${resetUrl}">${resetUrl}</a>
            <p>This link expires in 15 minutes.</p>
        `
    };
    
    try {
        await transporter.sendMail(mailOptions);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
 
    return res.status(200).json({ message: 'reset password email sent' });     
}
