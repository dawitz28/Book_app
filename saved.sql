DROP TABLE IF EXISTS favorites;
CREATE TABLE favorites (
  id SERIAL PRIMARY KEY, 
  title VARCHAR,
  author VARCHAR,
  description TEXT,
  thumbnail TEXT, 
  isbn TEXT, 
  bookshelf TEXT
);