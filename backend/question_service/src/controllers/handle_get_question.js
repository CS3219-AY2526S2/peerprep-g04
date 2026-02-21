import { get_all_questions_without_body, get_question_by_id, get_question_for_match } from "../database/db.js";

export async function handle_get_question_by_id(req, res) {
    const questionId = req.params.questionId;
    if (!questionId) {
        return res.status(400).json({ message: 'question id to get is missing in url'});
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

// the request body must contain { difficulties: string[], tags: string[] }.
// the names are important.
export async function handle_get_question_for_match(req, res) {
    const { difficulties, tags } = req.body;
    if (!(difficulties && tags)) {
        return res.status(400).json({ message: 'difficuties and tags are missing in get question for match' });
    }

    try {
        const question = await get_question_for_match(difficulties, tags);
        if (!question) {
            return res.status(404).json({ message: 'no question that satisfy requirements found' });
        }
        return res.status(200).json({
            message: 'question for match get successfully',
            ...question,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}