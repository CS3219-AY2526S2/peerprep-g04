### How to build and run
1. install packages: `npm install`
2. run database migrations: `npx node-pg-migrate up`. `node-pg-migrate` automatically reads the .env file for the required info, idk why.
3. start database: `sudo systemctl start postgresql`
4. log in to postgres: `sudo -u postgres psql`
5. create database: `create database peerprep_submission_service;`
4. start server: `node --env-file=.env server.js`

### How to build and run on MacOS
1. Log in to postgres: `psql postgres`
2. Create database: `CREATE DATABASE peerprep_submission_service;`
3. Install packages: `npm install`
4. Run database migrations: `npx node-pg-migrate up`
5. Start server: `node --env-file=.env server.js`

### How to run tests
1. to run tests: `npx vitest src/...`
