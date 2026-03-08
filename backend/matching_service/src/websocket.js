import { WebSocketServer } from "ws";
import { dequeue_user, get_match_by_user_id } from "./database/db.js";

const clients = new Map();

export function init_websocket_server(server) {
    const wss = new WebSocketServer({ server });

    wss.on("connection", (ws) => {
        ws.on("message", async (data) => {
            try {
                const msg = JSON.parse(data);
                if (msg.type === "register" && msg.user_id) {
                    clients.set(msg.user_id, ws);
                    ws.send(JSON.stringify({ type: "registered", user_id: msg.user_id }));

                    // if user was already matched, send match info again
                    const match = await get_match_by_user_id(msg.user_id);
                    if (match) {
                        const opponent_id = match.user1_id === msg.user_id ? match.user2_id : match.user1_id;
                        ws.send(JSON.stringify({
                            type: "reconnected",
                            match_id: match.id,
                            opponent_id,
                            topic: match.topic,
                            difficulty: match.difficulty,
                        }));
                    }
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

                    // notify opponent if user was matched
                    const match = await get_match_by_user_id(user_id);
                    if (match) {
                        const opponent_id = match.user1_id === user_id ? match.user2_id : match.user1_id;
                        notify_opponent_disconnected(opponent_id, user_id);
                    }

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

export function notify_opponent_disconnected(opponent_id, user_id) {
    const ws = clients.get(opponent_id);
    if (ws && ws.readyState === 1) {
        ws.send(JSON.stringify({ type: "opponent_disconnected", user_id }));
    }
}

export function notify_opponent_left(opponent_id, user_id) {
    const ws = clients.get(opponent_id);
    if (ws && ws.readyState === 1) {
        ws.send(JSON.stringify({ type: "opponent_left", user_id }));
    }
}

export { clients };