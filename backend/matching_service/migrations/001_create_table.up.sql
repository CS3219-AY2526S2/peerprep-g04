CREATE TABLE matches (
    id          INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user1_id    INT NOT NULL,
    user2_id    INT NOT NULL,
    question_id INT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE difficulties (
    match_id INT REFERENCES matches(id)  ON DELETE CASCADE,
    difficulty TEXT NOT NULL
);

CREATE TABLE topics (
    match_id INT REFERENCES matches(id) ON DELETE CASCADE,
    topic TEXT NOT NULL
);