import { delete_question, get_question_by_id } from "../database/db";

export async function handle_delete_question(req, res) {
    const questionId = req.params.questionId;
    if (!questionId) {
        return res.status(400).json({ message: 'question id to delete is missing from url' });
    }
    try {
        await delete_question(questionId);
        return res.status(200).json({ message: 'question successfully deleted'});
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}