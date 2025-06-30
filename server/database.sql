CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  question_text VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS answers (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES questions(id),
  answer_text VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO questions (question_text) VALUES
  ('What is your favorite color?'),
  ('Do you prefer coffee or tea?'),
  ('Are you a morning person or a night owl?');