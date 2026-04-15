import http from "http";
import { app } from "./src/app.js";
import { init_websocket_server } from "./src/websocket.js";
import { redis } from "./src/database/db.js";

const server = http.createServer(app);
await redis.flushDb();
init_websocket_server(server);

server.listen(process.env.PORT, (err) => {
    if (err) console.error(err);
    console.log(`Matching service listening on port ${process.env.PORT}`);
});