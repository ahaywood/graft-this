DELETE FROM Application;

DELETE FROM ApplicationStatus;

DELETE FROM Contact;

DELETE FROM Company;

DELETE FROM Credential;

DELETE FROM User;

DELETE FROM sqlite_sequence;

INSERT INTO "applicationStatus" ("id", "status") VALUES (1, 'New');

INSERT INTO "applicationStatus" ("id", "status") VALUES (2, 'Applied');

INSERT INTO "applicationStatus" ("id", "status") VALUES (3, 'Interview');

INSERT INTO "applicationStatus" ("id", "status") VALUES (4, 'Rejected');

INSERT INTO "applicationStatus" ("id", "status") VALUES (5, 'Offer');