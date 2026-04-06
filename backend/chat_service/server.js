import http from 'http'

const server = http.createServer();

server.listen(3004, (err) => {
    if (err) console.error(err);
    console.log(`Matching service listening on port 3004`);
});