FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

RUN addgroup -g 1001 -S nodeapp && adduser -S nodeapp -u 1001 -G nodeapp
RUN chown -R nodeapp:nodeapp /app
USER nodeapp

EXPOSE 1234

ENV HOST=::
ENV PORT=1234

CMD ["node", "./src/server.js"]
