package collaborationservice.demo.service;

import collaborationservice.demo.entity.Request;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.databind.ObjectMapper;

import collaborationservice.demo.entity.SessionData;

@Service
public class MessageCacheService {

    private final RedisTemplate<String, String> redis;
    private final long messageTtlMillis;
    private final long roomTtlMillis;
    private static final int MAX_HISTORY = 50;
    private final ObjectMapper mapper = new ObjectMapper();

    public MessageCacheService(@Qualifier("redisTemplate") RedisTemplate<String, String> redis,
                               @Value("${cache.message.ttl:300000}") long messageTtlMillis,
                               @Value("${cache.room.ttl:300000}") long roomTtlMillis) {
        this.redis = redis;
        this.messageTtlMillis = messageTtlMillis;
        this.roomTtlMillis = roomTtlMillis;
    }

    private String keyForRoom(String roomId) {
        return "room:msgs:" + roomId;
    }

    public void saveMessage(String roomId, String payload) {
        String key = keyForRoom(roomId);
        redis.opsForList().leftPush(key, payload);
        redis.opsForList().trim(key, 0, MAX_HISTORY - 1);
        redis.expire(key, Duration.ofMillis(messageTtlMillis));
    }

    public List<String> getRecentMessages(String roomId) {
        String key = keyForRoom(roomId);
        List<String> msgs = redis.opsForList().range(key, 0, -1);
        return msgs == null ? List.of() : msgs;
    }

    // --- room info caching ------------------------------------------------

    private String keyForRoomInfo(String userA, String userB, String roomId) {
        // canonicalize order to make lookup easier (smaller id first)
        if (userA.compareTo(userB) <= 0) {
            return "roominfo:" + userA + ":" + userB + ":" + roomId;
        } else {
            return "roominfo:" + userB + ":" + userA + ":" + roomId;
        }
    }

    /**
     * Cache details required for a client to reconnect.  The value can be any
     * string (JSON, URL, token, etc.).  Entry expires after roomTtlMillis milliseconds.
     */
    public void cacheRoomInfo(Request request) throws JsonProcessingException {

        String userA = request.getUserA();
        String userB = request.getUserB();
        String sessionId = request.getSessionId();

        String details = mapper.writeValueAsString(request);


        if (userA == null || userB == null || sessionId == null) {
            throw new IllegalArgumentException("Arguments must not be null");
        }
        String key = keyForRoomInfo(userA, userB, sessionId);
        redis.opsForValue().set(key, details);
        redis.expire(key, Duration.ofMillis(roomTtlMillis));
    }

    /**
     * Attempt to look up connection details for the given pair of users.  If
     * multiple rooms exist between them only the first hit is returned.
     */
    public String retrieveRoomInfo(String userA, String userB) {
        if (userA == null || userB == null) {
            return null;
        }
        // normalise userId order for lookup
        String low = userA.compareTo(userB) <= 0 ? userA : userB;
        String high = userA.compareTo(userB) <= 0 ? userB : userA;
        String pattern = "roominfo:" + low + ":" + high + ":*";
        List<String> keys = new ArrayList<>(redis.keys(pattern));
        if (keys.isEmpty()) {
            return null;
        }
        return redis.opsForValue().get(keys.get(0));
    }

    public String retrieveRoomInfoBySessionId(String sessionId) {
        if (sessionId == null) {
            return null;
        }

        String pattern = "roominfo:*:*:" + sessionId;
        List<String> keys = new ArrayList<>(redis.keys(pattern));
        if (keys.isEmpty()) {
            return null;
        }
        return redis.opsForValue().get(keys.get(0));
    }

    // --- user status caching ------------------------------------------------

    private String keyForUserStatus(String sessionId, String user) {
        return "userstatus:" + sessionId + ":" + user;
    }

    /**
     * Cache the completion status for a user in a session.
     * Status can be "completed" or "attempted".
     */
    public void cacheUserStatus(String sessionId, String user, String status) {
        String key = keyForUserStatus(sessionId, user);
        redis.opsForValue().set(key, status);
        redis.expire(key, Duration.ofMillis(roomTtlMillis));
    }

    /**
     * Get the completion status for a user in a session.
     */
    public String getUserStatus(String sessionId, String user) {
        String key = keyForUserStatus(sessionId, user);
        return redis.opsForValue().get(key);
    }

    // --- session user mapping ------------------------------------------------

    private String keyForSessionUsers(String sessionId) {
        return "sessionusers:" + sessionId;
    }

    public void cacheSessionUsers(String sessionId, String userA, String userB, String questionId) {
        String key = keyForSessionUsers(sessionId);
        redis.opsForHash().put(key, "userA", userA);
        redis.opsForHash().put(key, "userB", userB);
        redis.opsForHash().put(key, "questionId", questionId);
        redis.expire(key, Duration.ofMillis(roomTtlMillis));
    }

    public SessionData getSessionData(String sessionId) {
        String key = keyForSessionUsers(sessionId);
        String userA = (String) redis.opsForHash().get(key, "userA");
        String userB = (String) redis.opsForHash().get(key, "userB");
        String questionId = (String) redis.opsForHash().get(key, "questionId");
        if (userA == null || userB == null || questionId == null) {
            return null;
        }
        return new SessionData(userA, userB, questionId);
    }

}
