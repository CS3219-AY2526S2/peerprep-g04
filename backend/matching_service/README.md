### How to build and run
1. install packages: `npm install`
2. run database migrations: `npx node-pg-migrate up`. `node-pg-migrate` automatically reads the .env file for the required info.
3. start database: `sudo systemctl start postgresql`
4. log in to postgres: `sudo -u postgres psql`
5. create database: `create database peerprep_matching_service;`
6. start redis: `sudo systemctl start redis`
7. start server: `node --env-file=.env server.js`

### How to run tests
1. to run tests: `npx vitest src/...`