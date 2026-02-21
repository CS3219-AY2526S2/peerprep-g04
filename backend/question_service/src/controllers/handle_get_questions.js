import { get_all_questions_without_body, get_question_by_id } from "../database/db";

export async function handle_get_question_by_id(req, res) {
    const questionId = req.params.questionId;
    if (!questionId) {
        return res.status(400).json({ message: 'question id is missing in url'});
    }
    
    try {
        const question = await get_question_by_id(questionId);
        if (!question) {
            return res.status(404).json({ message: 'question id not found in database' });
        }
        return res.status(200).json({
            message: 'question get successfully',
            ...question,
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

export async function handle_get_all_questions_without_body(req, res) {
    try {
        const questions = await get_all_questions_without_body();
        return res.status(200).json({
            message: 'all questions get successfully',
            questions,
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}