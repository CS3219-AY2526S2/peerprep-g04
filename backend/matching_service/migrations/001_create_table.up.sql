CREATE TABLE matches (
    id          INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user1_id    INT NOT NULL,
    user2_id    INT NOT NULL,
    topic       TEXT NOT NULL,
    difficulty  TEXT NOT NULL,
    question_id INT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);