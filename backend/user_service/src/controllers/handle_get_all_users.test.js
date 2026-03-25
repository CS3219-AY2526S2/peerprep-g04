import { test, beforeEach, afterAll, expect } from "vitest";
import { pool } from "../database/db.js";
import request from "supertest";
import { app } from "../app.js";
import { ACCESS } from "../access.js";
import jwt from 'jsonwebtoken';
import { create_user } from "../database/db.js";

beforeEach(async () => {
    await pool.query(`DELETE FROM users;`);
});

afterAll(async () => {
    await pool.query(`DELETE FROM users;`);
});

test('get all users', async () => {
    const tom = {
        username: 'tom',
        email: 'tom@gmail.com',
        password_hash: 'abc',
        access: ACCESS.admin,
    };

    const jim = {
        username: 'jim',
        email: 'jim@gmail.com',
        password_hash: '123',
        access: ACCESS.user,
    }

    const arr = await Promise.all([create_user(...Object.values(tom)), create_user(...Object.values(jim))]);
    const valid_token = jwt.sign({ user_id: arr[0].id, access: 'admin' }, process.env.JWT_SECRET_KEY);

    const res = await request(app).get('/get-all-users').set('authorization', `Bearer ${valid_token}`);
    expect(res.status).toBe(200);
    expect(res.body.users).toHaveLength(2);
    expect(res.body.users.some(user => user.username === 'jim')).toBe(true);
});

test('non admin user should not be able to access users info', async () => {
    const tom = {
        username: 'tom',
        email: 'tom@gmail.com',
        password_hash: 'abc',
        access: ACCESS.admin,
    };

    const jim = {
        username: 'jim',
        email: 'jim@gmail.com',
        password_hash: '123',
        access: ACCESS.user,
    }

    const arr = await Promise.all([create_user(...Object.values(tom)), create_user(...Object.values(jim))]);
    const invalid_token = jwt.sign({ user_id: arr[1].id, access: 'user' }, process.env.JWT_SECRET_KEY);

    const res = await request(app).get('/get-all-users').set('authorization', `Bearer ${invalid_token}`);
    expect(res.status).toBe(403);
});

test('get user by id', async () => {
    const tom = {
        username: 'tom',
        email: 'tom@gmail.com',
        password_hash: 'abc',
        access: ACCESS.admin,
    };

    const jim = {
        username: 'jim',
        email: 'jim@gmail.com',
        password_hash: '123',
        access: ACCESS.user,
    }

    const arr = await Promise.all([create_user(...Object.values(tom)), create_user(...Object.values(jim))]);
    const valid_token = jwt.sign({ user_id: arr[0].id, access: 'admin' }, process.env.JWT_SECRET_KEY);

    const res = await request(app).get(`/get-user-by-id/${arr[1].id}`).set('authorization', `Bearer ${valid_token}`);
    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject(jim);
});

test('non admin cannot get user by id', async () => {
    const tom = {
        username: 'tom',
        email: 'tom@gmail.com',
        password_hash: 'abc',
        access: ACCESS.admin,
    };

    const jim = {
        username: 'jim',
        email: 'jim@gmail.com',
        password_hash: '123',
        access: ACCESS.user,
    }

    const arr = await Promise.all([create_user(...Object.values(tom)), create_user(...Object.values(jim))]);
    const invalid_token = jwt.sign({ user_id: arr[1].id, access: 'user' }, process.env.JWT_SECRET_KEY);

     const res = await request(app).get(`/get-user-by-id/${arr[1].id}`).set('authorization', `Bearer ${invalid_token}`);
    expect(res.status).toBe(403);
})

test('owner can get user by id', async () => {
    const owner = {
      username: 'owner',
      email: 'owner@gmail.com',
      password_hash: 'xyz',
      access: ACCESS.owner,
    };
  
    const user = {
      username: 'user1',
      email: 'user1@gmail.com',
      password_hash: '123',
      access: ACCESS.user,
    };
  
    const arr = await Promise.all([
      create_user(...Object.values(owner)),
      create_user(...Object.values(user)),
    ]);
  
    const token = jwt.sign(
      { user_id: arr[0].id, access: ACCESS.owner },
      process.env.JWT_SECRET_KEY
    );
  
    const res = await request(app)
      .get(`/get-user-by-id/${arr[1].id}`)
      .set('authorization', `Bearer ${token}`);
  
    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject(user);
  });

  test('owner can access all users', async () => {
    const owner = {
      username: 'owner',
      email: 'owner@gmail.com',
      password_hash: 'xyz',
      access: ACCESS.owner,
    };
  
    const user = {
      username: 'user1',
      email: 'user1@gmail.com',
      password_hash: '123',
      access: ACCESS.user,
    };
  
    const arr = await Promise.all([
      create_user(...Object.values(owner)),
      create_user(...Object.values(user)),
    ]);
  
    const token = jwt.sign(
      { user_id: arr[0].id, access: ACCESS.owner },
      process.env.JWT_SECRET_KEY
    );
  
    const res = await request(app)
      .get('/get-all-users')
      .set('authorization', `Bearer ${token}`);
  
    expect(res.status).toBe(200);
    expect(res.body.users).toHaveLength(2);
    expect(res.body.users.some(user => user.username === 'user1')).toBe(true);
  });
