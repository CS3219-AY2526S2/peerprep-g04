import { app } from "./app.js";
import { create_user, get_user_by_email, pool } from "./db.js";
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
    .toHaveProperty('access_token');

    const db_res = await get_user_by_email('tom@gmail.com');
    expect(db_res).toMatchObject({
        username: 'tom',
        email: 'tom@gmail.com',
        access: ACCESS.user,
    })
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
    expect(res.body).toHaveProperty('access_token').toHaveProperty('message');
    expect(res.body).toMatchObject({
        username: 'tom',
        email: 'tom@gmail.com',
        access: ACCESS.user,
    })
})

test('verify token successful', async () => {
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
    expect(res.body).toHaveProperty('access_token');

    const res2 = await request(app)
        .get('/verify-token')
        .set('authorization', `Bearer ${res.body.access_token}`);
    
    expect(res2.status).toBe(200);
    expect(res2.body).toMatchObject({
        username: 'tom',
        email: 'tom@gmail.com',
        access: ACCESS.user,
    });
})

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


