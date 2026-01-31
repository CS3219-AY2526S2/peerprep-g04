import { app } from "../app.js";
import { pool } from "../database/db.js";
import { beforeEach, afterAll, test, expect } from "vitest";
import request from 'supertest';
import { ACCESS } from "../access.js";

beforeEach(async () => {
    await pool.query(`
        DELETE FROM users;
    `);
});

afterAll(async () => {
    await pool.query(`
        DELETE FROM users;
    `);
});

test('login successful', async () => {
    await request(app)
        .post('/create-user')
        .send({
            username: 'tom',
            email: 'tom@gmail.com',
            password: 'abc',
        });

    const res = await request(app)
        .post('/login')
        .send({
            email: 'tom@gmail.com',
            password: 'abc',
        });
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('access_token').toHaveProperty('message');
    expect(res.body).toMatchObject({
        username: 'tom',
        email: 'tom@gmail.com',
        access: ACCESS.user,
    })
})