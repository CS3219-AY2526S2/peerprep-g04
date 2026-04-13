CREATE TABLE test_cases (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    question_id INT REFERENCES questions(id) ON DELETE CASCADE,
    input TEXT NOT NULL,
    expected_output TEXT NOT NULL
);