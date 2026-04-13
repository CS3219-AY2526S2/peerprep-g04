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

test('update user non admin user try to update other use', async () => {
    const res_tom = await request(app)
        .post('/create-user')
        .send({
            username: 'tom',
            email: 'tom@gmail.com',
            password: 'abc',
        });

    const res_jim = await request(app)
        .post('/create-user')
        .send({
            username: 'jim',
            email: 'jim@gmail.com',
            password: 'abc',
        })

    const res2 = await request(app)
        .patch(`/update-user/${res_jim.body.user_id}`)
        .set('authorization', `Bearer ${res_tom.body.access_token}`)
        .send({
            email: 'jim69@gmail.com'
        });
    
    expect(res2.status).toBe(403);
})

test('owner can update other user', async () => {
    const owner = await request(app)
      .post('/create-user')
      .send({
        username: 'owner',
        email: 'owner@gmail.com',
        password: 'abc',
      });
  
    const user = await request(app)
      .post('/create-user')
      .send({
        username: 'user1',
        email: 'user1@gmail.com',
        password: 'abc',
      });
  
    await pool.query(`
      UPDATE users SET access = 'owner' WHERE id = ${owner.body.user_id}
    `);
  
    const res = await request(app)
      .patch(`/update-user/${user.body.user_id}`)
      .set('authorization', `Bearer ${owner.body.access_token}`)
      .send({
        email: 'updated@gmail.com'
      });
  
    expect(res.status).toBe(200);
  });

  test('owner can update admin', async () => {
    const owner = await request(app)
      .post('/create-user')
      .send({
        username: 'owner',
        email: 'owner@gmail.com',
        password: 'abc',
      });
  
    const admin = await request(app)
      .post('/create-user')
      .send({
        username: 'admin',
        email: 'admin@gmail.com',
        password: 'abc',
      });
  
    await pool.query(`
      UPDATE users SET access = 'owner' WHERE id = ${owner.body.user_id}
    `);
  
    await pool.query(`
      UPDATE users SET access = 'admin' WHERE id = ${admin.body.user_id}
    `);
  
    const res = await request(app)
      .patch(`/update-user/${admin.body.user_id}`)
      .set('authorization', `Bearer ${owner.body.access_token}`)
      .send({
        email: 'admin_updated@gmail.com'
      });
  
    expect(res.status).toBe(200);
  });

  test('admin cannot demote another admin', async () => {
    const admin1 = await request(app)
      .post('/create-user')
      .send({
        username: 'admin1',
        email: 'admin1@gmail.com',
        password: 'abc',
      });
  
    const admin2 = await request(app)
      .post('/create-user')
      .send({
        username: 'admin2',
        email: 'admin2@gmail.com',
        password: 'abc',
      });
  
    await pool.query(`
      UPDATE users SET access = 'admin' WHERE id IN (${admin1.body.user_id}, ${admin2.body.user_id})
    `);
  
    const res = await request(app)
      .patch(`/update-user/${admin2.body.user_id}`)
      .set('authorization', `Bearer ${admin1.body.access_token}`)
      .send({
        access: 'user'
      });
  
    expect(res.status).toBe(403);
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

test('database constraint: cannot promote a second owner', async () => {
    const owner1 = await request(app)
        .post('/create-user')
        .send({
            username: 'owner1',
            email: 'owner1@gmail.com',
            password: 'abc'
        });

    await pool.query(`
        UPDATE users SET access = 'owner' WHERE id = ${owner1.body.user_id}
    `);

    const user2 = await request(app)
        .post('/create-user')
        .send({
            username: 'user2',
            email: 'user2@gmail.com',
            password: 'abc'
        });

    const res = await request(app)
        .patch(`/update-user/${user2.body.user_id}`)
        .set('authorization', `Bearer ${owner1.body.access_token}`)
        .send({
            access: 'owner'
        });
    
    expect(res.status).toBe(500); 
});