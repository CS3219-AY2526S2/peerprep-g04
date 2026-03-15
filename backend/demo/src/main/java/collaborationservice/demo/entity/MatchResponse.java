package collaborationservice.demo.entity;

/**
 * Response for match creation
 */
public class MatchResponse {
    private String sessionId;

    public MatchResponse() {}

    public MatchResponse(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }
}