import { WebSocketServer } from "ws";
import { dequeue_user } from "./database/db.js";

const clients = new Map();

export function init_websocket_server(server) {
    const wss = new WebSocketServer({ server });

    wss.on("connection", (ws) => {
        ws.on("message", (data) => {
            try {
                const msg = JSON.parse(data);
                if (msg.type === "register" && msg.user_id) {
                    clients.set(msg.user_id, ws);
                    ws.send(JSON.stringify({ type: "registered", user_id: msg.user_id }));
                }
            } catch {
                // ignore malformed messages
            }
        });

        ws.on("close", async () => {
            for (const [user_id, socket] of clients.entries()) {
                if (socket === ws) {
                    clients.delete(user_id);
                    await dequeue_user(user_id);
                    break;
                }
            }
        });
    });

    return wss;
}

export function notify_timeout(user_id) {
    const ws = clients.get(user_id);
    if (ws && ws.readyState === 1) {
        ws.send(JSON.stringify({ type: "timeout" }));
    }
}

export function notify_match(user_id1, user_id2, topics, difficulties) {
    const send_to = (user_id, opponent_id) => {
        const ws = clients.get(user_id);
        if (ws && ws.readyState === 1) {
            ws.send(JSON.stringify({ type: "matched", opponent_id, topics, difficulties }));
        }
    };
    send_to(user_id1, user_id2);
    send_to(user_id2, user_id1);
}

export { clients };