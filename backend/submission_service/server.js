import { app } from "./src/app.js";

app.listen(process.env.PORT, (err) => {
    if (err) console.log(err);
    console.log(`listening on localhost:${process.env.PORT}`);
})