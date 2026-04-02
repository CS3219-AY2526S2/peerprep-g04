CREATE DATABASE peerprep_user_service;

\c peerprep_user_service;

CREATE TABLE users (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    access TEXT
);

CREATE DATABASE peerprep_user_service;

\c peerprep_user_service;

CREATE TABLE users (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    access TEXT
);

CREATE TABLE submission_attempts (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, 
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_id INT NOT NULL,
    lang VARCHAR(32) NOT NULL,
    code TEXT NOT NULL,
    status VARCHAR(32) NOT NULL,
    submitted_at TIMESTAMP DEFAULT NOW()
);
