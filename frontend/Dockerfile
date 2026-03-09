# Build React
FROM node:24 as build
WORKDIR /app/frontend
COPY package*.json ./
RUN npm install
ARG VITE_SIGNALLING_SERVER_URL
ENV VITE_SIGNALLING_SERVER_URL=$VITE_SIGNALLING_SERVER_URL
COPY . .
RUN npm run build

# Express Server after build
FROM node:24
WORKDIR /usr/src/app
COPY package*.json ./
COPY --from=build /app/frontend/dist ./dist
RUN npm install --only=production
COPY server.js ./

# Expose for container
EXPOSE 5173
CMD ["node", "server.js"]
