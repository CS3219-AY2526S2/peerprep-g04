import { app } from "./src/app.js";
import { create_user } from "./src/database/db.js";

app.listen(process.env.PORT, (err) => {
    if (err) console.log(err);
    create_user('tim', 'tim@gmail.com', 'abc', 'admin').catch(err => console.log(err));
    console.log(`listening on localhost:${process.env.PORT}`);
})