package collaborationservice.demo.entity;

/**
 * Request for updating user status
 */
public class UserStatusUpdateRequest {
    private String sessionId;
    private String userId;
    private String status; // "completed" or "attempted"

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}