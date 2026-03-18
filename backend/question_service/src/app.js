import express from "express";
import cors from "cors";
import { handle_get_all_questions_without_body, handle_get_question_by_id, handle_get_question_for_match } from "./controllers/handle_get_question.js";
import { handle_create_question } from "./controllers/handle_create_question.js";
import { handle_delete_question } from "./controllers/handle_delete_question.js";
import { handle_update_question } from "./controllers/handle_update_question.js";
import { handle_get_all_tags } from "./controllers/handle_get_all_tags.js";
import { verify_token_middleware } from "./middleware/verify_token_middleware.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/get-question-by-id/:questionId', handle_get_question_by_id);
app.get('/get-all-questions-without-body', handle_get_all_questions_without_body);
app.get('/get-question-for-match', handle_get_question_for_match);
app.get('/get-all-tags', handle_get_all_tags);
app.post('/create-question', verify_token_middleware, handle_create_question);
app.delete('/delete-question/:questionId', verify_token_middleware, handle_delete_question);
app.patch('/update-question/:questionId', verify_token_middleware, handle_update_question);