# Stage 1: build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_USER_SERVICE_API
ARG VITE_QUESTION_SERVICE_API
ARG VITE_MATCHING_SERVICE_API
ARG VITE_COLLABORATION_SERVICE_API
ARG VITE_CHAT_SERVICE_API
ARG VITE_GOOGLE_AI_API_KEY
RUN npm run build

# Stage 2: serve
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY --from=builder /app/dist ./dist
EXPOSE 5173
CMD ["npx", "vite", "preview", "--host", "--port", "5173"]
