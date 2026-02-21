import express from "express";
import cors from "cors";
import { handle_get_all_questions_without_body, handle_get_question_by_id } from "./controllers/handle_get_questions";

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/get-question-by-id/:questionId', handle_get_question_by_id);
app.get('/get-all-questions-without-body', handle_get_all_questions_without_body);