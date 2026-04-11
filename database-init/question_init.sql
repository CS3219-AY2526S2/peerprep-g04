CREATE DATABASE peerprep_question_service;

\c peerprep_question_service;

CREATE TABLE questions (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title TEXT UNIQUE,
    difficulty TEXT,
    body TEXT
);

CREATE TABLE question_tag (
    question_id INT REFERENCES questions(id) ON DELETE CASCADE,
    tag TEXT,
    UNIQUE(question_id, tag)
);

CREATE TABLE test_cases (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    question_id INT REFERENCES questions(id) ON DELETE CASCADE,
    input TEXT NOT NULL,
    expected_output TEXT NOT NULL
);