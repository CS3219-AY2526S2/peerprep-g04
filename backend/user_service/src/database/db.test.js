import { ACCESS } from "../access.js";
import { create_user, delete_user, get_all_users, get_user_by_email, get_user_by_id, get_user_by_username, get_user_by_username_or_email, pool, update_user } from "./db.js"
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
    
    const rows2 = await get_user_by_email(tom.email);
    expect(rows2).toMatchObject(tom);

    const rows3 = await get_user_by_username(tom.username);
    expect(rows3).toMatchObject(tom);
    
    const row4 = await get_user_by_username_or_email(tom.username, 'fake@gmail.com');
    expect(row4[0]).toMatchObject(tom);

    const row5 = await get_user_by_id(rows.id);
    expect(row5).toMatchObject(tom);
});

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

    const rows2 = await update_user(rows.id, jim.username, jim.email, jim.password_hash, jim.access);
    expect(rows2).toMatchObject(jim);
});

test('get non-existent user', async () => {
    const r1 = await get_user_by_email('fake@gmail.com');
    expect(r1).toBeUndefined();

    const r2 = await get_user_by_id(1000);
    expect(r2).toBeUndefined();

    const r3 = await get_user_by_username('fake_person');
    expect(r3).toBeUndefined();
});

test('delete user', async () => {
    const tom = {
        username: 'tom',
        email: 'tom@gmail.com',
        password_hash: 'abc',
        access: ACCESS.user,
    }
    
    const row = await create_user(tom.username, tom.email, tom.password_hash, ACCESS.user);
    expect(row).toMatchObject(tom);

    await delete_user(row.id);
    const row2 = await get_user_by_id(row.id);
    expect(row2).toBeUndefined();

    const row3 = await get_user_by_username(tom.username);
    expect(row3).toBeUndefined();
});

test('get all users', async () => {
    const tom = {
        username: 'tom',
        email: 'tom@gmail.com',
        password_hash: 'abc',
        access: ACCESS.user,
    };

    const jim = {
        username: 'jim',
        email: 'jim@gmail.com',
        password_hash: '123',
        access: ACCESS.user,
    }

    await Promise.all([create_user(...Object.values(tom)), create_user(...Object.values(jim))]);
    const res = await get_all_users();
    expect(res.some(user => user.username === tom.username)).toBe(true);
    expect(res.some(user => user.username === jim.username)).toBe(true);
});

test('get user by id', async () => {
    const tom = {
        username: 'tom',
        email: 'tom@gmail.com',
        password_hash: 'abc',
        access: ACCESS.user,
    };

    const res = await create_user(...Object.values(tom));
    const res2 = await get_user_by_id(res.id);
    expect(res2).toMatchObject(tom);
})



