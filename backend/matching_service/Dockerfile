FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

RUN addgroup -S nodeapp && adduser -S nodeapp -G nodeapp

# combine CHOWN and COPY into 1 layer command
COPY --chown=nodeapp:nodeapp . .

USER nodeapp

ENV NODE_ENV=production
ENV HOST=:: 
ENV PORT=3003

EXPOSE 3003

CMD ["node", "server.js"]