CREATE DATABASE peerprep_collab_service;

\c peerprep_collab_service;

CREATE TABLE yjs_updates (
  id SERIAL PRIMARY KEY,
  room TEXT NOT NULL,
  update BYTEA NOT NULL
);