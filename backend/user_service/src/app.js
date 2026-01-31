import express from "express";
import { handle_create_user, handle_login, handle_update_user, verify_token } from "./controller.js";
import { verify_token_middleware } from "./middleware.js";

export const app = express()

app.use(express.json());

app.post('/create-user', handle_create_user);
app.post('/login', handle_login);
app.get('/verify-token', verify_token_middleware, verify_token);
app.patch('/update-user/:userId', verify_token_middleware, handle_update_user)
