CREATE DATABASE peerprep_submission_service;

\c peerprep_submission_service;

CREATE TYPE submission_status AS ENUM ('Accepted', 'Failed', 'Error');

CREATE TABLE submission_attempts (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, 
    user_id INT NOT NULL,
    question_id INT NOT NULL,
    lang VARCHAR(32) NOT NULL,
    code TEXT NOT NULL,
    status submission_status NOT NULL,
    submitted_at TIMESTAMP DEFAULT NOW()
);