import { WebSocketServer } from "ws";
import { dequeue_user, get_match_by_user_id, get_user_state, leave, states } from "./database/db.js";

const clients = new Map();
export const user_id_to_username = new Map();

export function init_websocket_server(server) {
    const wss = new WebSocketServer({ server });

    wss.on("connection", (ws) => {
        ws.on("message", async (data) => {
            try {
                const msg = JSON.parse(data);
                if (msg.type === "register" && msg.user_id) {
                    clients.set(msg.user_id, ws);
                    user_id_to_username.set(msg.user_id, msg.username);
                    ws.send(JSON.stringify({ type: "registered", user_id: msg.user_id }));

                    const state = get_user_state(msg.user_id);
                    // if user was already matched, send match info again
                    if (state === states.matched) {
                        const match = await get_match_by_user_id(msg.user_id);
                        const opponent_id = match.user1_id === msg.user_id ? match.user2_id : match.user1_id;
                        ws.send(JSON.stringify({
                            type: "reconnected",
                            match_id: match.id,
                            opponent_id,
                            opponent_username: user_id_to_username.get(opponent_id),
                            topic: match.topic,
                            difficulty: match.difficulty,
                            question_id: match.question_id,
                        }));
                    } 
                    
                    else if (state === states.matching) {
                        ws.send(JSON.stringify({
                            type: 'matching',
                        }));
                    }
                } else if (msg.type === 'leave' && msg.user_id) {
                    const state = get_user_state(msg.user_id);
                    if (state === states.matched) {
                        const match = await get_match_by_user_id(msg.user_id);
                        const opponent_id = match.user1_id === msg.user_id ? match.user2_id : match.user1_id;
                        notify_opponent_left(opponent_id, msg.user_id);
                    }
                    leave(msg.user_id);
                }
            } catch {
                // ignore malformed messages
            }
        });

        // 'close' event is a disconnect.
        ws.on("close", async () => {
            for (const [user_id, socket] of clients.entries()) {
                if (socket === ws) {
                    clients.delete(user_id);
                    await dequeue_user(user_id);

                    // notify opponent if user was matched
                    const state = await get_user_state(user_id);
                    if (state === states.matched) {
                        const match = await get_match_by_user_id(user_id);
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
    const username = user_id_to_username.get(user_id);
    if (ws && ws.readyState === 1) {
        ws.send(JSON.stringify({ type: "opponent_disconnected", user_id, username }));
    }
}

export function notify_opponent_left(opponent_id, user_id) {
    const ws = clients.get(opponent_id);
    const username = user_id_to_username.get(user_id);
    if (ws && ws.readyState === 1) {
        ws.send(JSON.stringify({ type: "opponent_left", user_id, username }));
    }
}

export { clients };