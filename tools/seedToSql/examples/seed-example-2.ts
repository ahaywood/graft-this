import { defineScript } from "rwsdk/worker";
import { db, setupDb } from "@/db";
import { env } from "cloudflare:workers";

export default defineScript(async () => {
  await setupDb(env);

  const createApplication = async () => {
    await db.application.create({
      data: {
        user: {
          connect: {
            id: "f8886f0e-fa1a-485a-9239-e066c0672bf9",
          },
        },
        applicationStatus: {
          connect: {
            id: 1,
          },
        },
        company: {
          create: {
            name: "RedwoodSDK",
            contacts: {
              create: {
                firstName: "John",
                lastName: "Doe",
                email: "john.doe@example.com",
                role: "Hiring Manager",
                userId: "c4f35853-8909-4139-98bb-c08663e4230c",
              },
            },
          },
        },
        salaryMin: "100000",
        salaryMax: "120000",
        jobTitle: "Software Engineer",
        jobDescription: "Software Engineer",
        postingUrl: "https://redwoodjs.com",
        dateApplied: new Date(),
      },
    });
  };

  await createApplication();

  console.log("🌱 Finished seeding");
});
