import { app } from "./src/app.js";

app.listen(process.env.PORT, (err) => {
    if (err) console.error(err);
    console.log(`Matching service listening on port ${process.env.PORT}`);
});