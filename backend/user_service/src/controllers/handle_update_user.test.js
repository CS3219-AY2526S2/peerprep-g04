import { app } from "../app.js";
import { pool } from "../database/db.js";
import { beforeEach, afterAll, test, expect } from "vitest";
import request from 'supertest';

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

test('update user successful', async () => {
    const res = await request(app)
        .post('/create-user')
        .send({
            username: 'tom',
            email: 'tom@gmail.com',
            password: 'abc',
        });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('access_token').toHaveProperty('user_id');

    const res2 = await request(app)
        .patch(`/update-user/${res.body.user_id}`)
        .set('authorization', `Bearer ${res.body.access_token}`)
        .send({
            email: 'tom20@gmail.com'
        });
    
    expect(res2.status).toBe(200);
})

test('update user invalid user id', async () => {
    const res = await request(app)
        .post('/create-user')
        .send({
            username: 'tom',
            email: 'tom@gmail.com',
            password: 'abc',
        });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('access_token').toHaveProperty('user_id');

    const res2 = await request(app)
        .patch(`/update-user/abc`)
        .set('authorization', `Bearer ${res.body.access_token}`)
        .send({
            email: 'tom20@gmail.com'
        });

    expect(res2.status).toBe(400);
})

test('update user invalid token', async () => {
    const res = await request(app)
        .post('/create-user')
        .send({
            username: 'tom',
            email: 'tom@gmail.com',
            password: 'abc',
        });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('access_token').toHaveProperty('user_id');

    const res2 = await request(app)
        .patch(`/update-user/${res.body.user_id}`)
        .set('authorization', `Bearer a.b.c`)
        .send({
            email: 'tom20@gmail.com'
        });
   
    expect(res2.status).toBe(401);
})

test('update user duplicate email', async () => {
    const res = await request(app)
        .post('/create-user')
        .send({
            username: 'tom',
            email: 'tom@gmail.com',
            password: 'abc',
        });

    await request(app)
        .post('/create-user')
        .send({
            username: 'jim',
            email: 'jim@gmail.com',
            password: 'abc',
        })

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('access_token').toHaveProperty('user_id');

    const res2 = await request(app)
        .patch(`/update-user/${res.body.user_id}`)
        .set('authorization', `Bearer ${res.body.access_token}`)
        .send({
            email: 'jim@gmail.com'
        });
    
    expect(res2.status).toBe(409);
})
