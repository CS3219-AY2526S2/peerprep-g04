import { test, beforeEach, afterAll, expect } from "vitest";
import { pool } from "../database/db.js";
import request from "supertest";
import { app } from "../app.js";
import { ACCESS } from "../access.js";

beforeEach(async () => {
    await pool.query(`DELETE FROM users;`);
});

afterAll(async () => {
    await pool.query(`DELETE FROM users;`);
});

// check your email if a reset email password is sent.
test('forgot password successful', async () => {
    const res = await request(app)
        .post('/create-user')
        .send({
            username: 'tom',
            email: 'tlim8772@gmail.com',
            password: 'abc',
        });
    
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
        username: 'tom',
        email: 'tlim8772@gmail.com',
        access: ACCESS.user,
    });

    const res2 = await request(app)
        .post('/forget-password/tlim8772@gmail.com');

    expect(res2.status).toBe(200);
    expect(res2.body).toHaveProperty('message');
})

test('forget password email not found', async () => {
    const res = await request(app)
        .post('/create-user')
        .send({
            username: 'tom',
            email: 'tlim8772@gmail.com',
            password: 'abc',
        });
    
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
        username: 'tom',
        email: 'tlim8772@gmail.com',
        access: ACCESS.user,
    });

    const res2 = await request(app)
        .post('/forget-password/tom@gmail.com');
    expect(res2.status).toBe(404);
    expect(res2.body).toHaveProperty('message');
})