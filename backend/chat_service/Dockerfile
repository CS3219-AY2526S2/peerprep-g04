FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

RUN addgroup -g 1001 -S nodeapp && adduser -S nodeapp -u 1001 -G nodeapp
RUN chown nodeapp:nodeapp /app
USER nodeapp

EXPOSE 3004

ENV HOST=::
ENV PORT=3004

CMD ["node", "./src/server.js"]
