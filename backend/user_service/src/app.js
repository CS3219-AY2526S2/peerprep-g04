import express from "express";
import { handle_create_user } from "./controllers/handle_create_user.js";
import { handle_login } from "./controllers/handle_login.js";
import { handle_update_user } from "./controllers/handle_update_user.js";
import { verify_token_middleware } from "./middlewares/verify_token_middleware.js";
import { verify_token } from "./controllers/verify_token.js";
import { handle_delete_user } from "./controllers/handle_delete_user.js";
import cors from 'cors';
import { handle_forget_password } from "./controllers/handle_forget_password.js";
import { handle_get_all_users, handle_get_user_by_id } from "./controllers/handle_get_all_users.js";
import { handle_create_submission } from "./controllers/handle_create_submission.js";
import { handle_get_submission_history } from "./controllers/handle_get_submission_history.js";

export const app = express()

app.use(cors());
app.use(express.json());

app.post('/create-user', handle_create_user);
app.post('/login', handle_login);
app.get('/verify-token', verify_token_middleware, verify_token);
app.patch('/update-user/:userId', verify_token_middleware, handle_update_user);
app.delete('/delete-user/:userId', verify_token_middleware, handle_delete_user);
app.post('/forget-password/:email', handle_forget_password);
app.get('/get-all-users', verify_token_middleware, handle_get_all_users);
app.get('/get-user-by-id/:id', verify_token_middleware, handle_get_user_by_id);
app.post('/create-submission', verify_token_middleware, handle_create_submission);
app.get('/get-submission-history/:questionId', verify_token_middleware, handle_get_submission_history);

app.use((err, req, res, next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    console.log(err);
    res.status(status).json({
        message: message,
    });
});
