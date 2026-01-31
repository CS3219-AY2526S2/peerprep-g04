import express from "express";
import { handle_create_user } from "./controllers/handle_create_user.js";
import { handle_login } from "./controllers/handle_login.js";
import { handle_update_user } from "./controllers/handle_update_user";
import { verify_token_middleware } from "./middlewares/verify_token_middleware.js";
import { verify_token } from "./controllers/verify_token.js";

export const app = express()

app.use(express.json());

app.post('/create-user', handle_create_user);
app.post('/login', handle_login);
app.get('/verify-token', verify_token_middleware, verify_token);
app.patch('/update-user/:userId', verify_token_middleware, handle_update_user)
