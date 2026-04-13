import { get_submissions_by_question } from "../database/db.js";

export async function handle_get_submission_history(req, res) {
    try {
        const userId = req.user_id;
        const questionId = parseInt(req.params.questionId, 10);

        if (isNaN(questionId)) {
            return res.status(400).json({ message: 'invalid question id' });
        }

        const submissions = await get_submissions_by_question(questionId, userId);

        return res.status(200).json({
            message: 'submission history retrieved successfully',
            submissions
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}