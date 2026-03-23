CREATE DATABASE collab_db;

\c collab_db;

CREATE TABLE yjs_updates (
  id SERIAL PRIMARY KEY,
  room TEXT NOT NULL,
  update BYTEA NOT NULL
);