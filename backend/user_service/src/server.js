import { app } from "./app.js";

app.listen(3000, (err) => {
    if (err) console.log(err);
    console.log('listening on localhost:3000');
})