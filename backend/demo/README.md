how to start:
Backend: I recommend using IntelliJ idea to run it instead of using maven which could be very troublesome. Java 17 is used.
Frontend: Just a normal react and run with npm. It is also located in the same file as I am not sure how to put it together with the frontend.


how to use:
This is a bit troublesome as when I write the code, the frontend of matching service is not yet there.
1. Use a api test tool to fake a post request from matching service when backend runnning
url: http://localhost:8080/collab/start
body: {
  "sessionId": "fake-match-123",
  "userA": "Yitao",
  "userB": "AI-Partner",
  "questionId": "101",
  "title": "Two Sum",
  "difficulty": "Easy",
  "topic": "Array",
  "body": "given a nums and a target..."
}
2. Run front end. Instead of using the given url, directly enter: http://localhost:3000/collab/fake-match-123


Port issue:
Frontend: 3000
Backend: 8080
Redis: 6379

side note: 
Redis can just use Aida's one first. 
I have not included a legit editor yet, but as long as the url is the same, they can connect to the same websocket connection. 

Other changes:
Matching service: I added 1 Get request to question service to retrieve the question and 1 Post request to collaboration service to pass the question, in the handle_join_queue.js but yet to verify it works as expected.