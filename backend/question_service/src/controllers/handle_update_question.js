import { get_question_by_id, update_question } from "../database/db.js";

// send a body that contain
// { title: string, difficulty: string, tags: string[], body: string }
// but need not contain all of these fields.
export async function handle_update_question(req, res) {
    const questionId = req.params.questionId;
    if (!questionId) {
        return res.status(400).json({ message: 'question id to update is missing from url' });
    }
    
    const { title, difficulty, tags, body } = req.body;
    if (!(title || difficulty || tags || body)) {
        return res.status(400).json({ message: 'no fields given to update' });
    }

    try {
        const question = await get_question_by_id(questionId);
        if (!question) {
            return res.status(400).json({ message: 'question id to update does not exist' });
        }
        
        const new_question = {
            ...question,
            ...(title && { title }),
            ...(difficulty && { difficulty }),
            ...(tags && { tags }),
            ...(body && { body }),
        };
        await update_question(question.id, new_question);
        return res.status(200).json({ message: 'message updated successfully' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

}