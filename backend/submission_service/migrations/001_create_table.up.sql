CREATE TABLE submission_attempts (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, 
    user_id INT NOT NULL,
    question_id INT NOT NULL,
    lang VARCHAR(32) NOT NULL,
    code TEXT NOT NULL,
    status VARCHAR(32) NOT NULL,
    submitted_at TIMESTAMP DEFAULT NOW()
);
