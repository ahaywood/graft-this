# RedwoodSDK Addon Installer

This document explains the `installAddon.mjs` script, which automates the installation of RedwoodSDK addons into your project.

## Overview

The `installAddon.mjs` script is a comprehensive tool that handles all aspects of installing an addon into your RedwoodSDK project, including:

- Copying addon files to the correct location
- Installing required dependencies
- Setting up environment variables
- Injecting CSS styles
- Adding routes to your application
- Setting up Prisma schema
- Installing ShadCN UI components

## Usage

```bash
node src/scripts/installAddon.mjs install <addonName> [options]
```

### Options

| Option | Description |
|--------|-------------|
| `--repo <url>` | Install from a GitHub repository |
| `--source <path>` | Full path to the addon directory (not its parent) |
| `--dest <path>` | Destination directory (defaults to src/app/addons) |
| `--help` | Display help message |

### Examples

#### Install from a local directory:

```bash
node src/scripts/installAddon.mjs install suggest --source /path/to/addons/suggest
```

#### Install from a GitHub repository:

```bash
node src/scripts/installAddon.mjs install suggest --repo https://github.com/username/repo/addons
```

## Installation Process

The script performs the following steps during installation:

### 1. Parse the addon.jsonc File

The script reads the addon's configuration from its `addon.jsonc` file, which contains information about:

- Addon name and description
- Required packages
- Environment variables
- Routes configuration
- ShadCN UI components
- CSS styles
- Post-install message

### 2. Install Framework Dependencies

If the addon requires specific frameworks, the script will install them:

- **Tailwind CSS**: If `tailwind: true` is specified in the addon.jsonc
- **ShadCN UI**: If `shadcn: true` or `shadcn: { required: true }` is specified

### 3. Install ShadCN Components

If the addon uses ShadCN UI components, the script will:

1. Ensure ShadCN UI is installed in your project
2. Install each required component listed in the `shadcn.components` array

### 4. Install Package Dependencies

The script installs any packages listed in the `packages` array using `pnpm add`.

### 5. Set Up Environment Variables

For each environment variable listed in the `env` array, the script:

1. Checks if the variable already exists in your `.env` file
2. If not, adds the variable to your `.env` file (without a value)

### 6. Inject CSS Styles

If the addon includes CSS styles:

1. The script looks for the target styles file specified in `styles.injectInto`
2. Adds the import directive specified in `styles.injectDirective`
3. Ensures proper ordering with Tailwind and ShadCN imports if needed

### 7. Add Routes

If the addon includes routes:

1. Adds an import statement for the routes file to your `worker.tsx`
2. Adds the routes to your application's render array
3. Applies any specified route prefix

### 8. Set Up Prisma Schema

The script:

1. Ensures the proper Prisma directory structure exists
2. Merges any Prisma schema files from the addon
3. Creates a migration for the merged schema

### 9. Generate Routes

Finally, the script runs the route generation process to update your application's routing.

## Addon Source Options

### Local Installation

When using the `--source` flag, you specify the exact directory containing the addon files. The script will:

1. Copy all files from the source directory to your project's addons directory
2. Process the addon.jsonc file to complete the installation

### GitHub Installation

When using the `--repo` flag, you specify a GitHub repository URL. The script will:

1. Use `degit` to clone the repository into your project's addons directory
2. Process the addon.jsonc file to complete the installation

## Troubleshooting

If you encounter issues during installation:

1. **Missing addon.jsonc**: Ensure the addon directory contains a valid addon.jsonc file
2. **Failed package installation**: Check that the required packages are available in npm
3. **ShadCN component errors**: Verify that the components listed in the addon.jsonc exist in the ShadCN UI library
4. **Route conflicts**: Check for route path conflicts with existing routes in your application

## Advanced Usage

### Custom Destination Directory

By default, addons are installed to `src/app/addons`, but you can specify a custom destination with the `--dest` flag:

```bash
node src/scripts/installAddon.mjs install suggest --source /path/to/suggest --dest /custom/path
```

### Manual Configuration

After installation, you can manually edit the addon files in your project's addons directory to customize its behavior.
