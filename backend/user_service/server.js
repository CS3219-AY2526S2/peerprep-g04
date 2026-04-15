import { app } from "./src/app.js";
import { hash_password } from "./src/controllers/utils.js";
import { create_user, get_user_by_email, get_user_by_username, connectWithRetry, redis } from "./src/database/db.js";

async function seed_dummy_users() {
    const dummyUsers = [
        { username: 'tim', email: 'tim@gmail.com', password: 'abc', role: 'owner' },
        
        { username: 'alice', email: 'alice@gmail.com', password: 'abc', role: 'admin' },
        
        { username: 'bob', email: 'bob@gmail.com', password: 'abc', role: 'user' },
        { username: 'charlie', email: 'charlie@gmail.com', password: 'abc', role: 'user' },
        { username: 'diana', email: 'diana@gmail.com', password: 'abc', role: 'user' },
        { username: 'evan', email: 'evan@gmail.com', password: 'abc', role: 'user' },
        { username: 'fiona', email: 'fiona@gmail.com', password: 'abc', role: 'user' },
        { username: 'george', email: 'george@gmail.com', password: 'abc', role: 'user' },
        { username: 'hannah', email: 'hannah@gmail.com', password: 'abc', role: 'user' },
        { username: 'ian', email: 'ian@gmail.com', password: 'abc', role: 'user' },
        { username: 'jane', email: 'jane@gmail.com', password: 'abc', role: 'user' },
        { username: 'kevin', email: 'kevin@gmail.com', password: 'abc', role: 'user' },
        { username: 'laura', email: 'laura@gmail.com', password: 'abc', role: 'user' },
        { username: 'mike', email: 'mike@gmail.com', password: 'abc', role: 'user' },
        { username: 'nina', email: 'nina@gmail.com', password: 'abc', role: 'user' }
    ];

    console.log("Seeding dummy users to database...");
    
    for (const u of dummyUsers) {
        try {
            const existingUsername = await get_user_by_username(u.username);
            const existingEmail = await get_user_by_email(u.email);
            
            if (!existingUsername && !existingEmail) {
                await create_user(u.username, u.email, hash_password(u.password), u.role);
                console.log(`Successfully created: ${u.username} (${u.role})`);
            } else {
                console.log(`Skipped ${u.username}: Already exists.`);
            }
        } catch (err) {
            console.error(`Failed to create user ${u.username}:`, err.message);
        }
    }
}

app.listen(process.env.PORT || 3000, async (err) => {
    if (err) console.log(err);

    await connectWithRetry().catch(err => {
        console.error("Failed to connect to User DB:", err);
        process.exit(1);
    });

    await redis.flushDb();
    await seed_dummy_users();
    
    console.log(`listening on localhost:${process.env.PORT || 3000}`);
});