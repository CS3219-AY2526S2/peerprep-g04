import { app } from "./app.js";
import { create_user, pool } from "./db.js";
import { beforeEach, afterAll, test, expect } from "vitest";
import request from 'supertest';
import { ACCESS } from "./access.js";

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

test('create user successful', async () => {
    const res = await request(app)
        .post('/create-user')
        .send({
            username: 'tom',
            email: 'tom@gmail.com',
            password: 'abc',
        });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
        username: 'tom',
        email: 'tom@gmail.com',
        access: ACCESS.user,
    })
    .toHaveProperty('token');
})

test('create user missing fields', async () => {
    const res = await request(app)
        .post('/create-user')
        .send({
            username: 'tom',
            email: 'tom@gmail.com'
        })

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
})

test('create user duplicate email', async () => {
    await create_user('tom', 'tom@gmail.com', 'abc', ACCESS.user);
    
    const res = await request(app)
        .post('/create-user')
        .send({
            username: 'jim',
            email: 'tom@gmail.com',
            password: 'abc',
        })
    
        expect(res.status).toBe(409);
        expect(res.body).toHaveProperty('message');
})

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
    expect(res.body).toHaveProperty('token').toHaveProperty('message');
    expect(res.body).toMatchObject({
        username: 'tom',
        email: 'tom@gmail.com',
        access: ACCESS.user,
    })
})


