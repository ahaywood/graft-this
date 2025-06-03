# GraftThis

A command-line tool for installing utility tools that work with the RWSDK (Redwood SDK).

## Installation

```bash
npm install -g rwsdk-tools
# or for local development
npm link
```

## Usage

Run the command-line tool to install utilities:

```bash
# Install all available tools
npx rwsdk-tools

# Install specific tools
npx rwsdk-tools routes
npx rwsdk-tools component
npx rwsdk-tools tailwind
npx rwsdk-tools seedtosql
npx rwsdk-tools merge
npx rwsdk-tools email
npx rwsdk-tools windsurf

# Show help
npx rwsdk-tools help
```

## How It Works

This package provides a simple command-line interface to install utility tools for RWSDK projects. When you run a command, it:

1. Copies the necessary files to your project
2. Adds appropriate scripts to your package.json
3. Sets up everything so you can use the tools immediately

## Available Tools

### generateRoutes

The `generateRoutes` tool helps generate routes for your RWSDK project.

```bash
npx rwsdk-tools routes
```

This command:

1. Copies the `generateRoutes.ts` script to your project's `src/scripts` directory
2. Adds a `routes` script to your project's package.json file that runs: `npx tsx src/scripts/generateRoutes.ts`

After installation, you can generate routes by running:

```bash
npm run routes
```

### componentGenerator

The `component` tool helps generate and restructure React components for your RWSDK project using Plop.

```bash
npx rwsdk-tools component
```

This command:

1. Copies the `plopfile.mjs` file to your project's root directory
2. Copies component templates to a `plop-templates` directory
3. Adds the following scripts to your project's package.json:
   - `plop`: Run the plop CLI
   - `component`: Generate a new component
   - `restructure`: Restructure an existing component
   - `restructure-all`: Restructure all components in a directory
4. Automatically installs plop as a dev dependency if it's not already installed

After installation, you can use the component generator by running:

```bash
# Generate a new component
npm run component

# Restructure an existing component
npm run restructure

# Restructure all components
npm run restructure-all
```

### tailwindSetup

The `tailwind` tool sets up Tailwind CSS for your RWSDK project.

```bash
npx rwsdk-tools tailwind
```

This command:

1. Creates a `src/app/styles.css` file with the Tailwind import
2. Updates the `vite.config.mts` file to:
   - Import the Tailwind plugin
   - Add the environments config if needed
   - Add Tailwind to the plugins array
3. Updates the `src/app/Document.tsx` file to:
   - Import the styles
   - Add a link tag to the head
4. Prompts you to install the required dependencies

The command will automatically install the required dependencies for you:

```bash
pnpm install tailwindcss @tailwindcss/vite
```

### shadcnSetup

The `shadcn` tool sets up shadcn UI components for your RWSDK project.

```bash
npx rwsdk-tools shadcn
```

This command:

1. Copies a pre-configured `components.json` file to your project's root directory
2. Installs all necessary dependencies for shadcn UI:
   - class-variance-authority
   - clsx
   - tailwind-merge
   - lucide-react
   - @radix-ui/react-slot
   - tw-animate-css
3. Sets up the required configuration:
   - Updates `tsconfig.json` with the baseUrl setting
   - Adds path aliases to `vite.config.ts` for the "@" import
4. Creates the necessary files:
   - Adds a `src/app/lib/utils.ts` file with the `cn` utility function
   - Sets up `src/app/styles.css` with shadcn theme variables
5. Updates the `src/app/Document.tsx` file to:
   - Import the styles
   - Add a link tag to the head

After installation, you can add shadcn components to your project by installing the specific Radix UI components you need and copying the component code from the shadcn website.

### seedToSql

The `seedToSql` tool converts Redwood.js seed files to raw SQL statements that can be executed directly against your database.

```bash
npx rwsdk-tools seedtosql
```

This command:

1. Copies the `seedToSql.mjs` script to your project's `src/scripts` directory
2. Makes the script executable
3. Adds a `seedtosql` script to your project's package.json file that runs: `node src/scripts/seedToSql.mjs`

After installation, you can convert seed files to SQL by running:

```bash
# Convert the default seed file (or specify a custom one)
pnpm run seedtosql

# Convert a specific seed file
pnpm run seedtosql -- --input <path-to-seed-file> [--output <path-to-output-sql>]
```

Features:

- Converts Prisma `create` operations to `INSERT` statements
- Converts Prisma `createMany` operations to multiple `INSERT` statements
- Preserves raw SQL commands from `$executeRawUnsafe`
- Handles nested relations and connections
- Supports TypeScript and JavaScript seed files
- No external dependencies required

### mergePrisma

The `merge` tool combines multiple Prisma schema files into a single schema.prisma file.

```bash
npx rwsdk-tools merge
```

This command:

1. Copies the `mergePrismaSchema.mjs` script to your project's `src/scripts` directory
2. Adds a `merge` script to your project's package.json file that runs: `node src/scripts/mergePrismaSchema.mjs`

After installation, you can merge your Prisma schemas by running:

```bash
pnpm merge
```

Features:

- Automatically finds and merges all .prisma files from specified directories
- Backs up existing schema.prisma file to schema.prisma.bak before overwriting it
- Includes the backup file content in the merge process to preserve existing schema
- Uses .bak extension to avoid Prisma validation errors with duplicate models
- Intelligently merges models with the same name, preserving unique fields
- Handles generators, datasources, models, and enums
- Supports commented model additions with special syntax
- Sorts models alphabetically for better readability

### email

The `email` tool sets up email functionality for your RWSDK project using Resend.

```bash
npx rwsdk-tools email
```

This command:

1. Installs the `resend` package using pnpm
2. Adds a `RESEND_API` variable to your project's `.env` file
3. Creates an `email.ts` file in the `src/app/lib` directory
4. Asks if you want to install React Email for creating email templates

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

Features:

- Seamless integration with Resend's email API
- Environment variable setup for secure API key storage
- Optional React Email integration for beautiful, responsive email templates
- Works with Cloudflare Workers environment variables
- Simple, clean API for sending emails from your application

### windsurf

The `windsurf` tool sets up configuration for code quality checks and workflows in your RWSDK project.

```bash
npx rwsdk-tools windsurf
```

This command:

1. Creates a `.windsurf` directory in your project root (if it doesn't already exist)
2. Copies default rules to the `.windsurf/rules` directory
3. Copies workflow templates to the `.windsurf/workflows` directory

After installation, you can customize the Windsurf configuration by editing the files in the `.windsurf` directory.

Features:

- Pre-configured code quality rules
- Workflow templates for pre-commit and PR checks
- Non-destructive installation that preserves existing configurations
- Custom rule definitions for project-specific requirements
- Integrated workflow templates that work with common package managers

## Requirements

- Node.js 14+
- RWSDK
