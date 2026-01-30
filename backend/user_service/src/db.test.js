import { ACCESS } from "./access.js";
import { create_user, get_user_by_email, get_user_by_username, get_user_by_username_or_email, pool, update_user } from "./db"
import { test, expect, beforeEach, afterEach, afterAll } from 'vitest';

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

test('create and get user', async () => {
    const tom = {
        username: 'tom',
        email: 'tom@gmail.com',
        password_hash: 'abc',
        access: ACCESS.user,
    }
    
    const rows = await create_user(tom.username, tom.email, tom.password_hash, ACCESS.user);
    expect(rows).toMatchObject(tom);
    expect(rows).toHaveProperty('id');
    
    const rows2 = await get_user_by_email(tom.email);
    expect(rows2).toMatchObject(tom);
    expect(rows2).toHaveProperty('id');

    const rows3 = await get_user_by_username(tom.username);
    expect(rows3).toMatchObject(tom);
    expect(rows3).toHaveProperty('id');
    
    const row4 = await get_user_by_username_or_email(tom.username, 'fake@gmail.com');
    expect(row4[0]).toMatchObject(tom);
    expect(row4[0]).toHaveProperty('id');
})

test('create and update user', async () => {
    const tom = {
        username: 'tom',
        email: 'tom@gmail.com',
        password_hash: 'abc',
        access: ACCESS.user,
    }

    const jim = {
        username: 'jim',
        email: 'jim@gmail.com',
        password_hash: '123',
        access: ACCESS.user,
    }


    const rows = await create_user(tom.username, tom.email, tom.password_hash, tom.access);
    expect(rows).toMatchObject(tom);

    const rows2 = await update_user(rows.id, jim.username, jim.email, jim.password_hash);
    expect(rows2).toMatchObject(jim);
})

test('get non-existent user', async () => {
    const result = await get_user_by_email('fake@gmail.com');
    expect(result).toBeUndefined();
})

