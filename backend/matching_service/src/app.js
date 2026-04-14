import express from "express";
import cors from "cors";
import { verify_token_middleware } from "./middlewares/verify_token_middleware.js";
import { handle_join_queue } from "./controllers/handle_join_queue.js";
import { handle_leave_queue } from "./controllers/handle_leave_queue.js";
import { handle_queue_status } from "./controllers/handle_queue_status.js";
import { handle_my_match } from "./controllers/handle_my_match.js";
import { handle_match_count } from "./controllers/handle_match_count.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.post('/join-queue', verify_token_middleware, handle_join_queue);
app.delete('/leave-queue', verify_token_middleware, handle_leave_queue);
app.get('/queue-status', verify_token_middleware, handle_queue_status);
app.get('/my-match', verify_token_middleware, handle_my_match);
app.get('/match-count', verify_token_middleware, handle_match_count);