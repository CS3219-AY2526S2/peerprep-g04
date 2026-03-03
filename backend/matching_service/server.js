import { server } from "./src/app.js";

server.listen(3002, (err) => {
    if (err) {
        console.log(err.message);
    } else {
        console.log(`server listening on http://localhost:3002`);
    }
})