# GraftThis

A command-line tool for installing utility tools that work with the RWSDK (Redwood SDK).

## Installation

```bash
npm install -g graftthis
# or for local development
npm link
```

## Usage

Run the command-line tool to install utilities:

```bash
# Install all available tools
npx graftthis

# Install specific tools
npx graftthis routes
npx graftthis component
npx graftthis tailwind

# Show help
npx graftthis help
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
npx graftthis routes
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
npx graftthis component
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
npx graftthis tailwind
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

## Requirements

- Node.js 14+
- RWSDK
