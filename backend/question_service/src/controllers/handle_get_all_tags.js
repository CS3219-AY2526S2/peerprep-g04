import { get_all_tags } from "../database/db";

export async function handle_get_all_tags(req, res) {
    try {
        const tags = await get_all_tags();
        return res.status(200).send({ message: 'get all tags succesfully', tags });
    } catch (err) {
        return res.status(500).send({ message: err.message });
    }
}