import http from "http";
import { app } from "./src/app.js";
import { init_websocket_server } from "./src/websocket.js";

const server = http.createServer(app);

init_websocket_server(server);

server.listen(process.env.PORT, "0.0.0.0", (err) => {
    if (err) console.error(err);
    console.log(`Matching service listening on 0.0.0.0:${process.env.PORT}`);
});