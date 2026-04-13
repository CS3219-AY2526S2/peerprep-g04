user = backend/user_service
question = backend/question_service
match = backend/matching_service
collab = backend/collaboration_service
chat = backend/chat_service
submission = backend/submission_service

run:
	node --env-file=$(user)/.env $(user)/server.js & \
	node --env-file=$(question)/.env $(question)/server.js & \
	node --env-file=$(match)/.env $(match)/server.js & \
	node --env-file=$(collab)/.env $(collab)/src/server.js & \
	node --env-file=$(chat)/.env $(chat)/server.js & \
	node --env-file=$(submission)/.env $(submission)/server.js &