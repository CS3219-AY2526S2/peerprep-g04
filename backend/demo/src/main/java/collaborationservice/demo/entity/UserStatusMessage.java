package collaborationservice.demo.entity;

/**
 * Message sent via RabbitMQ for user status notifications
 */
public class UserStatusMessage {
    private String userId;
    private String questionId;
    private String status; // "completed" or "attempted"

    public UserStatusMessage() {}

    public UserStatusMessage(String userId, String questionId, String status) {
        this.userId = userId;
        this.questionId = questionId;
        this.status = status;
    }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getQuestionId() { return questionId; }
    public void setQuestionId(String questionId) { this.questionId = questionId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}