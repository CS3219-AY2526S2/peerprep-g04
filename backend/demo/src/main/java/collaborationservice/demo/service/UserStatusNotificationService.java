package collaborationservice.demo.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import collaborationservice.demo.entity.UserStatusMessage;

@Service
public class UserStatusNotificationService {

    private final RestTemplate restTemplate;
    private final String userServiceUrl;

    public UserStatusNotificationService(@Value("${user.service.url:http://localhost:8081}") String userServiceUrl) {
        this.restTemplate = new RestTemplate();
        this.userServiceUrl = userServiceUrl;
    }

    public void sendUserStatus(String userId, String questionId, String status) {
        try {
            UserStatusMessage message = new UserStatusMessage(userId, questionId, status);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<UserStatusMessage> request = new HttpEntity<>(message, headers);

            String url = userServiceUrl + "/api/user/status";
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                System.out.println("Successfully sent status update for user: " + userId);
            } else {
                System.err.println("Failed to send status update for user: " + userId + ", status: " + response.getStatusCode());
            }
        } catch (Exception e) {
            System.err.println("Error sending status update for user: " + userId + ", error: " + e.getMessage());
        }
    }
}
