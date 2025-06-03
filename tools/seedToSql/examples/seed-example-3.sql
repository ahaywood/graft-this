-- Delete all records from the User table
DELETE FROM User;

-- Reset the SQLite sequence counter
DELETE FROM sqlite_sequence;

-- Insert a new user with id "1" and username "testuser"
INSERT INTO User (id, username) VALUES ('1', 'testuser');

-- End of seed script
