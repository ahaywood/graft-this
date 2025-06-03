# Email Tool for Redwood SDK

This tool helps you set up email functionality in your Redwood project using [Resend](https://resend.com).

## Features

- Installs the Resend package
- Adds the necessary environment variable to your `.env` file
- Creates an email client in `src/app/lib/email.ts`
- Optionally sets up React Email for creating email templates

## Installation

Run the following command in your Redwood project:

```bash
npx rwsdk-tools email
```

## What It Does

When you run the tool, it will:

1. Install the `resend` package using pnpm
2. Add a `RESEND_API` variable to your `.env` file
3. Create an `email.ts` file in the `src/app/lib` directory
4. Ask if you want to install React Email for creating email templates

## Usage

After installation, you can use the Resend client in your application:

```typescript
import { resend } from 'src/app/lib/email';

// Send an email
await resend.emails.send({
  from: 'onboarding@resend.dev',
  to: 'user@example.com',
  subject: 'Hello World',
  html: '<p>Hello world!</p>',
});
```

### With React Email

If you chose to install React Email, you can create email templates using React components. See the [React Email documentation](https://react.email/docs) for more information.

## Configuration

Make sure to add your Resend API key to the `.env` file:

```
RESEND_API=your_resend_api_key_here
```

You can get an API key by signing up at [Resend](https://resend.com).

## Documentation

For more information on using Resend, check out the [Resend documentation](https://resend.com/docs).
