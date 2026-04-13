import express from "express";
import cors from "cors";

import { verify_token_middleware } from "./middlewares/verify_token_middleware.js";
import { handle_create_submission } from "./controllers/handle_create_submission.js";
import { handle_get_submission_history } from "./controllers/handle_get_submission_history.js";
import { handle_get_user_stats } from "./controllers/handle_get_user_stats.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.post('/create-submission', verify_token_middleware, handle_create_submission);
app.get('/get-submission-history/:questionId', verify_token_middleware, handle_get_submission_history);
app.get('/user-stats', verify_token_middleware, handle_get_user_stats);