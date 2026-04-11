import { server } from "./src/app.js";

server.listen(process.env.PORT, () => {
    console.log(`chat service listening on port ${process.env.PORT}`);
});