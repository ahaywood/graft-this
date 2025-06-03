---
description: How to implement email sending with Resend in a Redwood SDK project
---

# Sending Emails with Resend in a Redwood SDK Project

This workflow guides you through setting up and using Resend to send emails in your Redwood SDK project.

## Setting Up Resend

1. Create a Resend account
   
   Go to [Resend](https://resend.com/) and click on **Get Started** to create an account.

2. Create an API key
   
   After creating your account, create an API key by clicking on the "Add API Key" button in your Resend dashboard.

3. Add the API key to your environment variables
   
   ```bash
   # Create or edit your .env file
   echo "RESEND_API=your_api_key_here" >> .env
   ```
   
   > Note: If you don't have an `.env` file, you can duplicate the `.env.example` file and rename it to `.env`.
   
   Redwood SDK with Cloudflare uses a `.dev.vars` file for environment variables, but the common practice is to use a `.env` file. When you run `pnpm dev`, it will automatically create a symlink between your `.env` and `.dev.vars` files.

4. Install the Resend package
   
   ```bash
   npm install resend
   # or
   yarn add resend
   # or
   pnpm add resend
   ```

## Creating a Constants File (Optional but Recommended)

1. Create a constants file to store reusable values
   
   ```bash
   mkdir -p src/app/shared
   touch src/app/shared/constants.ts
   ```

2. Add email constants to the file
   
   ```typescript
   // src/app/shared/constants.ts
   
   export const CONSTANTS = Object.freeze({
     FROM_EMAIL: "Your App <onboarding@resend.dev>",
   });
   ```

## Sending Emails

### Basic Email Setup

Create a utility function for sending emails:

```typescript
// src/app/lib/email.ts

import { Resend } from "resend";
import { CONSTANTS } from "../shared/constants";

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API);

export async function sendEmail({
  to,
  subject,
  text,
  html,
  react,
}: {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  react?: React.ReactNode;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: CONSTANTS.FROM_EMAIL,
      to,
      subject,
      text,
      html,
      react,
    });

    if (error) {
      console.error("Error sending email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Exception sending email:", error);
    return { success: false, error };
  }
}
```

### Example: Sending a Text Email

```typescript
// src/app/auth/actions.ts or any other file

import { sendEmail } from "../lib/email";

export async function sendWelcomeEmail(email: string, name: string) {
  return await sendEmail({
    to: email,
    subject: "👋 Welcome to Our App!",
    text: `Hello ${name}, welcome to our app! We're excited to have you on board.`,
  });
}
```

### Example: Sending a React Email

1. Create an email template component:

```typescript
// src/app/emails/WelcomeEmail.tsx

import React from "react";

export default function WelcomeEmail({ name }: { name: string }) {
  return (
    <div>
      <h1>Welcome to Our App!</h1>
      <p>Hello {name},</p>
      <p>We're excited to have you on board. Here are some next steps:</p>
      <ul>
        <li>Complete your profile</li>
        <li>Explore our features</li>
        <li>Connect with others</li>
      </ul>
      <p>If you have any questions, feel free to reach out to our support team.</p>
    </div>
  );
}
```

2. Use the template in your email function:

```typescript
// src/app/auth/actions.ts or any other file

import { sendEmail } from "../lib/email";
import WelcomeEmail from "../emails/WelcomeEmail";

export async function sendWelcomeEmail(email: string, name: string) {
  return await sendEmail({
    to: email,
    subject: "👋 Welcome to Our App!",
    react: <WelcomeEmail name={name} />,
  });
}
```

### Example: Sending an HTML Email

```typescript
// src/app/auth/actions.ts or any other file

import { sendEmail } from "../lib/email";

export async function sendPasswordResetEmail(email: string, resetLink: string) {
  return await sendEmail({
    to: email,
    subject: "Password Reset Request",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Password Reset</h1>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 4px;">Reset Password</a>
        <p>If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}
```

## Testing Emails

Resend provides specific test email addresses to simulate different delivery scenarios:

- `delivered@resend.dev` - Simulates successful delivery
- `bounced@resend.dev` - Simulates a bounced email

Do NOT use addresses like `@example.com` or `@test.com` for testing as they can lead to bounces and affect your sender reputation.

Example test function:

```typescript
// src/app/lib/email.test.ts

import { sendEmail } from "./email";

export async function testEmailDelivery() {
  // Test successful delivery
  const deliveryResult = await sendEmail({
    to: "delivered@resend.dev",
    subject: "Test Delivery",
    text: "This is a test email for successful delivery.",
  });
  
  // Test bounce
  const bounceResult = await sendEmail({
    to: "bounced@resend.dev",
    subject: "Test Bounce",
    text: "This is a test email for bounce simulation.",
  });
  
  return {
    deliveryResult,
    bounceResult,
  };
}
```

## Domain Verification

Until you verify your domain with Resend, there are several limitations:

1. You can only send emails from Resend's default addresses (e.g., `onboarding@resend.dev`)
2. Emails from unverified domains are more likely to be flagged as spam
3. Free accounts have a daily limit of 100 emails and a monthly limit of 3,000 emails
4. All accounts are subject to a rate limit of 2 requests per second

To verify your domain, follow the instructions in [Resend's domain verification documentation](https://resend.com/docs/dashboard/domains/introduction).

## Troubleshooting

- **Emails not sending**: Check your API key and ensure it's correctly set in your environment variables
- **Emails going to spam**: Verify your domain and ensure your email content follows best practices
- **Rate limiting errors**: Ensure you're not exceeding the 2 requests per second limit
- **422 errors**: Check if you're using test domains like `@example.com` that Resend rejects

## Further Reading

- [Resend's Official Documentation](https://resend.com/docs/introduction)
- [React Email](https://react.email/) - For creating beautiful email templates
- [Email Testing Best Practices](https://resend.com/docs/knowledge-base/what-email-addresses-to-use-for-testing)
