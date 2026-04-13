import { app } from "./src/app.js";
import { create_user, get_user_by_email, get_user_by_username, connectWithRetry } from "./src/database/db.js";

async function create_tim() {
    const res = await get_user_by_username('tim');
    const res2 = await get_user_by_email('tim@gmail.com');
    if (res || res2) return;
    await create_user('tim', 'tim@gmail.com', 'abc', 'owner');
}

app.listen(process.env.PORT, async (err) => {
    if (err) console.log(err);

    // Adding retry logic in case database not ready
    await connectWithRetry().catch(err => {
        console.error("Failed to connect to  User DB:", err);
        process.exit(1);
    });

    create_tim();
    console.log(`listening on localhost:${process.env.PORT}`);
})