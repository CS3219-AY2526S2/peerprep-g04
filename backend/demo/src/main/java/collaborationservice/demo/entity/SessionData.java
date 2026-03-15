package collaborationservice.demo.entity;

/**
 * Data structure for session information
 */
public class SessionData {
    private String userA;
    private String userB;
    private String questionId;

    public SessionData(String userA, String userB, String questionId) {
        this.userA = userA;
        this.userB = userB;
        this.questionId = questionId;
    }

    public String getUserA() { return userA; }
    public String getUserB() { return userB; }
    public String getQuestionId() { return questionId; }
}