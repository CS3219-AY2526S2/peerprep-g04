import { create_question_from_obj } from "../database/db.js";

// in the request body, send a json obj
// { title: string, difficulty: string, tags: string[], body: string }
export async function handle_create_question(req, res) {
    let { title, difficulty, tags, body } = req.body;
    if (!(title && difficulty && tags && body)) {
        return res.status(400).json({
            message: 'title and/or difficulty and/or tags and/or body is missing'
        });
    }
    
    try {
        difficulty = difficulty.toLowerCase();
        tags = tags.map(tag => tag.toLowerCase());
        
        const id = await create_question_from_obj(req.body);
        return res.status(201).json({
            message: 'question created succesfully',
            id,
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

}