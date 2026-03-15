# APIs Open to Matching Service

This document describes the REST endpoints exposed by the Collaboration Service that the Matching Service can call to initiate collaboration sessions.

## Base URL
Assuming the service is running on `http://localhost:8080`, all endpoints are prefixed with `/api/match`.

## Endpoints

### POST /api/match/start
Initiates a collaboration session for two matched users.

**Request Body:**
```json
{
  "sessionId": "string",  // Unique identifier for the collaboration session
  "userA": "string",      // Identifier for the first user
  "userB": "string",      // Identifier for the second user
  "questionId": "string"  // Identifier for the question being collaborated on
}
```

**Response:**
```json
{
  "sessionId": "string"   // Echoes back the session ID
}
```

**Status Codes:**
- `200 OK`: Session started successfully
- `400 Bad Request`: Invalid request body
- `500 Internal Server Error`: Server error

**Description:**
When the Matching Service pairs two users, it calls this endpoint with a unique `sessionId`. The Collaboration Service acknowledges the match and prepares for WebSocket connections from both users using the provided `sessionId` as the room identifier.

**Example Request:**
```bash
curl -X POST http://localhost:8080/api/match/start \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session-12345",
    "userA": "user1",
    "userB": "user2",
    "questionId": "question-1"
  }'
```

**Example Response:**
```json
{
  "sessionId": "session-12345"
}
```

## POST /api/match/status
Updates the completion status for a user in a collaboration session.

**Request Body:**
```json
{
  "sessionId": "string",  // The session ID
  "userId": "string",     // The user ID
  "status": "string"      // "completed" or "attempted"
}
```

**Response:**
`200 OK` on success.

**Description:**
This endpoint allows updating the status of a user's work on the question. When the room closes, the status is sent to the respective user services.

## WebSocket Endpoint
After calling the start endpoint, users can connect to the WebSocket at:
`ws://localhost:8080/ws?session={sessionId}`

This allows real-time collaboration on coding problems.