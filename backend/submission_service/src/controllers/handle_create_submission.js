import { create_submission } from "../database/db.js";

export async function handle_create_submission(req, res) {
    const user_id = req.user_id; 

    const { question_id, lang, code, status } = req.body;

    if (!question_id || !lang || !code || !status) {
        return res.status(400).json({ 
            message: "Missing required fields: question_id, lang, code, status" 
        });
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