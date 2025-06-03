---
description: How to create and use React Email templates in a Redwood SDK project
---

# Creating Email Templates with React Email

This workflow guides you through setting up React Email to create responsive email templates in your Redwood SDK project.

## Prerequisites

- A Redwood SDK project
- Resend API key (see the `/resend` workflow)

## Installation

1. Install the React Email components
   ```bash
   pnpm add @react-email/components resend
   ```

2. Install the React Email Preview tool
   ```bash
   npx create-email@latest
   ```

   This creates a `react-email-starter` directory with example templates.

3. Start the development server
   ```bash
   cd react-email-starter
   pnpm install
   pnpm dev
   ```

   This starts a server at http://localhost:3000 for previewing templates.

## Creating a Basic Email Template

1. Create a directory for email templates
   ```bash
   mkdir -p src/app/emails
   ```

2. Create a basic template file
   ```tsx
   // src/app/emails/WelcomeEmail.tsx
   import {
     Body, Container, Head, Heading,
     Html, Preview, Text
   } from "@react-email/components";
   
   interface WelcomeEmailProps {
     name: string;
   }
   
   export default function WelcomeEmail({ name = "User" }: WelcomeEmailProps) {
     return (
       <Html>
         <Head />
         <Preview>Welcome to our application, {name}!</Preview>
         <Body style={{
           fontFamily: 'Arial, sans-serif',
           margin: '0',
           padding: '0',
           backgroundColor: '#f6f9fc',
         }}>
           <Container style={{
             maxWidth: '600px',
             margin: '0 auto',
             padding: '20px',
             backgroundColor: '#ffffff',
             borderRadius: '4px',
           }}>
             <Heading style={{ color: '#333', fontSize: '24px' }}>
               Welcome, {name}!
             </Heading>
             <Text style={{ color: '#555', fontSize: '16px' }}>
               Thank you for joining our platform!
             </Text>
           </Container>
         </Body>
       </Html>
     );
   }
   ```

## Using Tailwind CSS

1. Import and use the Tailwind component
   ```tsx
   // src/app/emails/WelcomeEmailWithTailwind.tsx
   import {
     Body, Container, Head, Heading, Html,
     Preview, Text, Tailwind
   } from "@react-email/components";
   
   export default function WelcomeEmailWithTailwind({ name = "User" }) {
     return (
       <Tailwind>
         <Html>
           <Head />
           <Preview>Welcome to our application, {name}!</Preview>
           <Body className="bg-gray-100 my-0 mx-auto font-sans">
             <Container className="max-w-[600px] mx-auto my-[40px] p-[20px] bg-white rounded">
               <Heading className="text-2xl font-bold text-gray-800 mb-4">
                 Welcome, {name}!
               </Heading>
               <Text className="text-gray-600 mb-4">
                 Thank you for joining our platform!
               </Text>
             </Container>
           </Body>
         </Html>
       </Tailwind>
     );
   }
   ```

2. Custom Tailwind configuration (optional)
   ```tsx
   // src/app/emails/tailwind.config.ts
   export default {
     theme: {
       extend: {
         colors: {
           brand: "#007291",
         },
       },
     },
   };
   
   // Import and use:
   import tailwindConfig from "./tailwind.config";
   <Tailwind config={tailwindConfig}>
     {/* Email content */}
   </Tailwind>
   ```

## Testing Email Templates

1. Copy templates to the preview tool
   
   Copy your template files to `react-email-starter/emails` to preview them.

2. Preview in browser at http://localhost:3000

3. Export templates using the "Export" button to get HTML or plain text.

## Integrating with Resend

```tsx
// src/app/actions/sendEmail.ts
import { Resend } from "resend";
import WelcomeEmail from "../emails/WelcomeEmail";

const resend = new Resend(process.env.RESEND_API);

export async function sendWelcomeEmail(email: string, name: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: "Your App <onboarding@resend.dev>",
      to: email,
      subject: "Welcome to Your App!",
      react: <WelcomeEmail name={name} />,
    });

    return error ? { success: false, error } : { success: true, data };
  } catch (error) {
    return { success: false, error };
  }
}
```

## Tips for Email Development

1. **Keep it simple**: Email clients have limited CSS support.
2. **Test across clients**: Use the preview tool to test in different email clients.
3. **Use inline styles or Tailwind**: More reliable than external stylesheets.
4. **Responsive design**: Ensure emails look good on all devices.
5. **Accessibility**: Include alt text and ensure good color contrast.

## Further Reading

- [React Email Documentation](https://react.email/docs/introduction)
- [React Email Components](https://react.email/docs/components/html)
- [React Email Pre-Built Components](https://react.email/components)
- [React Email and Tailwind CSS](https://react.email/docs/components/tailwind)
- [Resend Documentation](https://resend.com/docs/introduction)
