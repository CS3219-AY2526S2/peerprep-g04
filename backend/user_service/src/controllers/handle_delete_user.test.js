import { app } from "../app.js";
import { pool } from "../database/db.js";
import { beforeEach, afterAll, test, expect } from "vitest";
import request from 'supertest';

beforeEach(async () => {
    await pool.query(`
        TRUNCATE TABLE users RESTART IDENTITY CASCADE;
    `);
});

afterAll(async () => {
    await pool.query(`
        TRUNCATE TABLE users RESTART IDENTITY CASCADE;
    `);
});

test('delete user successful', async () => {
    const res = await request(app)
        .post('/create-user')
        .send({
            username: 'tom',
            email: 'tom@gmail.com',
            password: 'abc'
        });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('access_token').toHaveProperty('user_id');

    const res2 = await request(app)
        .delete(`/delete-user/${res.body.user_id}`)
        .set('authorization', `Bearer ${res.body.access_token}`);
    
    expect(res2.status).toBe(200);
});

test('delete user non admin user try to delete other user', async () => {
    const res_tom = await request(app)
        .post('/create-user')
        .send({
            username: 'tom',
            email: 'tom@gmail.com',
            password: 'abc'
        });

    const res_jim = await request(app)
        .post('/create-user')
        .send({
            username: 'jim',
            email: 'jim@gmail.com',
            password: 'abc'
        });

    expect(res_tom.status).toBe(201);
    expect(res_tom.body).toHaveProperty('access_token').toHaveProperty('user_id');

    const res2 = await request(app)
        .delete(`/delete-user/${res_tom.body.user_id}`)
        .set('authorization', `Bearer ${res_jim.body.access_token}`);
    
    expect(res2.status).toBe(403);
});

test('database trigger: cannot delete the last owner', async () => {
    const owner = await request(app)
        .post('/create-user')
        .send({
            username: 'owner',
            email: 'owner@gmail.com',
            password: 'abc'
        });

    await pool.query(`
        UPDATE users SET access = 'owner' WHERE id = ${owner.body.user_id}
    `);

    const res = await request(app)
        .delete(`/delete-user/${owner.body.user_id}`)
        .set('authorization', `Bearer ${owner.body.access_token}`);
    
    expect(res.status).toBe(500);
});

test('database trigger: cannot demote the last owner', async () => {
    const owner = await request(app)
        .post('/create-user')
        .send({
            username: 'owner',
            email: 'owner@gmail.com',
            password: 'abc'
        });

    await pool.query(`
        UPDATE users SET access = 'owner' WHERE id = ${owner.body.user_id}
    `);

    const res = await request(app)
        .patch(`/update-user/${owner.body.user_id}`)
        .set('authorization', `Bearer ${owner.body.access_token}`)
        .send({
            access: 'admin'
        });
    
    expect(res.status).toBe(500);
});