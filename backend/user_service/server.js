import { app } from "./src/app.js";
import { create_user } from "./src/database/db.js";

function create_super_admin() {
    create_user('tim', 'tim@gmail.com', 'abc', 'admin');
}

app.listen(process.env.PORT, (err) => {
    if (err) console.log(err);
    create_super_admin();
    console.log(`listening on localhost:${process.env.PORT}`);
})