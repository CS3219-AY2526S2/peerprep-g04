import { create_submission } from "../database/db.js";

export async function handle_create_submission(req, res) {
    const { user_id, question_id, lang, code, status } = req.body;

    if (!user_id || !question_id || !lang || !code || !status) {
        return res.status(400).json({ 
            message: "Missing required fields: user_id, question_id, lang, code, status" 
        });
    }

    if (req.user.id !== user_id) {
        return res.status(403).json({ message: "Cannot submit on behalf of another user" });
    }

    try {
        const submission = await create_submission(user_id, question_id, lang, code, status);
        return res.status(201).json({
            message: "Submission created successfully",
            submission
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}