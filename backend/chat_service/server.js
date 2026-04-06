import { server } from "./src/app.js";

server.listen(3004, () => {
    console.log(`chat service listening on port ${3004}`)
});