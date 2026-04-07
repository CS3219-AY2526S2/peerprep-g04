import { server } from "./src/app.js";

const PORT = process.env.PORT;

server.listen(PORT, () => {
    console.log(`chat service listening on port ${PORT}`);
});