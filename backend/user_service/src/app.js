import express from "express";
import { handle_create_user, handle_login, verify_token } from "./controller.js";

export const app = express()

app.use(express.json());

app.post('/create-user', handle_create_user);
app.post('/login', handle_login);
app.get('/verify-token', verify_token);
