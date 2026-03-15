package collaborationservice.demo.handler;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.web.socket.CloseStatus;

import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import collaborationservice.demo.service.MessageCacheService;
import collaborationservice.demo.service.UserStatusNotificationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import collaborationservice.demo.entity.Request;
import collaborationservice.demo.entity.SessionData;

/**
 * Simple in‑memory websocket handler that groups sessions by a "session" query parameter.
 * Each message received is broadcast to the other participant(s) in the same room.
 */
@Component
public class CollaborationWebSocketHandler extends TextWebSocketHandler {

    // room id -> connected web socket sessions
    private final Map<String, List<WebSocketSession>> roomSessions = new ConcurrentHashMap<>();

    // room-specific single-thread executors, created when the API allocates a room
    private final Map<String, java.util.concurrent.Executor> roomExecutors = new ConcurrentHashMap<>();

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(CollaborationWebSocketHandler.class);

    private final java.util.concurrent.Executor messageExecutor;

    @Autowired
    private MessageCacheService cacheService;

    @Autowired
    private UserStatusNotificationService notificationService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public CollaborationWebSocketHandler(java.util.concurrent.Executor messageExecutor) {
        this.messageExecutor = messageExecutor;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String roomId = extractRoomId(session.getUri());
        log.info("connection established for room={} sessionId={}", roomId, session.getId());
        roomSessions.computeIfAbsent(roomId, r -> new CopyOnWriteArrayList<>()).add(session);

        // Send problem information to the newly connected client
        sendProblemInfo(session, roomId);

        // replay recent messages from cache so reconnecting user sees context
        List<String> recent = cacheService.getRecentMessages(roomId);
        for (String msg : recent) {
            getExecutorForRoom(roomId).execute(() -> {
                try {
                    session.sendMessage(new TextMessage(msg));
                } catch (Exception ex) {
                    log.warn("failed to replay message to {}", session.getId(), ex);
                }
            });
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String roomId = extractRoomId(session.getUri());
        log.debug("message in room {} from {} length={}", roomId, session.getId(), message.getPayloadLength());
        List<WebSocketSession> list = roomSessions.getOrDefault(roomId, List.of());
        // broadcast asynchronously so that one slow client doesn't block others
        for (WebSocketSession s : list) {
            if (!s.getId().equals(session.getId()) && s.isOpen()) {
                getExecutorForRoom(roomId).execute(() -> {
                    try {
                        s.sendMessage(message);
                    } catch (Exception ex) {
                        log.warn("failed to send message to {}", s.getId(), ex);
                    }
                });
            }
        }
        // cache message for replay
        cacheService.saveMessage(roomId, message.getPayload());
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String roomId = extractRoomId(session.getUri());
        log.info("connection closed for room={} sessionId={}", roomId, session.getId());
        List<WebSocketSession> list = roomSessions.get(roomId);
        if (list != null) {
            list.remove(session);
            if (list.isEmpty()) {
                roomSessions.remove(roomId);
                // Room is closed, notify user services
                notifyUserServicesOnRoomClose(roomId);
            }
        }
    }

    /**
     * Called by an external API to allocate the resources associated with a new room.
     * The handler keeps a single-thread executor per room so that tasks for that room
     * are sequentialized independently of others.
     */
    public void allocateRoomExecutor(String roomId) {
        roomExecutors.computeIfAbsent(roomId, id -> java.util.concurrent.Executors.newSingleThreadExecutor(r -> new Thread(r, "room-"+id)));
    }

    private java.util.concurrent.Executor getExecutorForRoom(String roomId) {
        return roomExecutors.getOrDefault((Object) roomId, messageExecutor);
    }

    private void notifyUserServicesOnRoomClose(String roomId) {
        SessionData sessionData = cacheService.getSessionData(roomId);
        if (sessionData == null) {
            log.warn("No session data found for room {}", roomId);
            return;
        }
        String userA = sessionData.getUserA();
        String userB = sessionData.getUserB();
        String questionId = sessionData.getQuestionId();

        // Get status for each user, default to "attempted" if not set
        final String statusA = cacheService.getUserStatus(roomId, userA) != null ? cacheService.getUserStatus(roomId, userA) : "attempted";
        final String statusB = cacheService.getUserStatus(roomId, userB) != null ? cacheService.getUserStatus(roomId, userB) : "attempted";

        // Send notifications asynchronously
        getExecutorForRoom(roomId).execute(() -> {
            try {
                notificationService.sendUserStatus(userA, questionId, statusA);
                log.info("Sent status {} for user {} on question {}", statusA, userA, questionId);
            } catch (Exception e) {
                log.error("Failed to send status for user {}", userA, e);
            }
        });
        getExecutorForRoom(roomId).execute(() -> {
            try {
                notificationService.sendUserStatus(userB, questionId, statusB);
                log.info("Sent status {} for user {} on question {}", statusB, userB, questionId);
            } catch (Exception e) {
                log.error("Failed to send status for user {}", userB, e);
            }
        });
    }

    private String extractRoomId(URI uri) {
        String query = uri.getQuery();
        if (query != null) {
            for (String param : query.split("&")) {
                String[] pair = param.split("=");
                if (pair.length == 2 && "session".equals(pair[0])) {
                    return pair[1];
                }
            }
        }
        return null;
    }

    private void sendProblemInfo(WebSocketSession session, String roomId) {
        try {
            String cached = cacheService.retrieveRoomInfoBySessionId(roomId);
            if (cached == null) {
                log.warn("No cached room info found for room {}", roomId);
                return;
            }

            // The cache stores the original Request JSON; use it as the problem info
            Request problemInfo = objectMapper.readValue(cached, Request.class);

            String problemJson = objectMapper.writeValueAsString(problemInfo);
            String message = "PROBLEM_INFO:" + problemJson;

            getExecutorForRoom(roomId).execute(() -> {
                try {
                    session.sendMessage(new TextMessage(message));
                    log.info("Sent problem info to session {}", session.getId());
                } catch (Exception ex) {
                    log.warn("Failed to send problem info to {}", session.getId(), ex);
                }
            });
        } catch (Exception e) {
            log.error("Error sending problem info for room {}", roomId, e);
        }
    }
}
