import { format_user } from "./utils.js"

// must be called after verify_token_middleware
export async function verify_token(req, res) {
    return res.status(200).json({ 
        message: 'access token verified',
        ...format_user(req.user),
    })
}