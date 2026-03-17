package collaborationservice.demo.controller;

import collaborationservice.demo.entity.SessionData;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import collaborationservice.demo.entity.Request;
import collaborationservice.demo.entity.MatchResponse;
import collaborationservice.demo.entity.UserStatusUpdateRequest;
import collaborationservice.demo.service.MessageCacheService;

/**
 * This controller exposes a simple REST endpoint that the matching service
 * can call when two users have been paired.  The body should contain a
 * session id that both users will use when they open the websocket
 * collaboration page.
 */

@RestController
@RequestMapping("/collab")
public class RoomController {

    private final MessageCacheService cacheService;

    public RoomController(MessageCacheService cacheService) {
        this.cacheService = cacheService;
    }

    @PostMapping("/start")
    public ResponseEntity<MatchResponse> startCollaboration(@RequestBody Request request) {
        try {
            // cache connection details so a client can recover after an accidental
            // disconnect.  Here we simply store the websocket URL but the matching
            // service could send any metadata it needs.
            cacheService.cacheRoomInfo(request);
            cacheService.cacheSessionUsers(request.getSessionId(), new SessionData( request.getUserA(), request.getUserB(), request.getQuestionId()));

            MatchResponse resp = new MatchResponse(request.getSessionId());
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Update the completion status for a user in a session.
     */
    @PostMapping("/status")
    public ResponseEntity<Void> updateUserStatus(@RequestBody UserStatusUpdateRequest request) {
        cacheService.cacheUserStatus(request.getSessionId(), request.getUserId(), request.getStatus());
        return ResponseEntity.ok().build();
    }
}


