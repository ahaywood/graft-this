INSERT INTO "company" ("name") VALUES ('RedwoodSDK');

INSERT INTO "contacts" ("firstName", "lastName", "email", "role", "userId", "companyId") VALUES ('John', 'Doe', 'john.doe@example.com', 'Hiring Manager', 'c4f35853-8909-4139-98bb-c08663e4230c', (SELECT id FROM "company" WHERE name = 'RedwoodSDK'));

INSERT INTO "application" ("userId", "applicationStatusId", "companyId", "salaryMin", "salaryMax", "jobTitle", "jobDescription", "postingUrl", "dateApplied") VALUES ('f8886f0e-fa1a-485a-9239-e066c0672bf9', 1, (SELECT id FROM "company" WHERE name = 'RedwoodSDK'), '100000', '120000', 'Software Engineer', 'Software Engineer', 'https://redwoodjs.com', CURRENT_TIMESTAMP);