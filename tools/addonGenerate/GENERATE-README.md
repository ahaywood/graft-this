# RedwoodSDK Addon Configuration Generator

This document explains the `generateAddonConfig.mjs` script, which automatically analyzes an addon's content and generates the `addon.jsonc` configuration file.

## Overview

The `generateAddonConfig.mjs` script scans your addon's codebase to detect:

- Package dependencies
- Environment variables
- CSS files
- Route files
- ShadCN UI components

Based on this analysis, it generates an `addon.jsonc` file that describes your addon's requirements and configuration.

## Usage

```bash
node src/scripts/generateAddonConfig.mjs <addon-name>
```

Where `<addon-name>` is the name of your addon (e.g., "suggest").

## Generated Configuration

The script generates an `addon.jsonc` file with the following sections:

### Basic Information

```json
{
  "name": "your-addon-name",
  "description": "your-addon-name add-on for RWSDK",
  "version": "0.1.0"
}
```

### Routes

If your addon includes a routes file (`routes.ts`, `routes.tsx`, `routes.js`, or `routes.jsx`), the script will detect it and add:

```json
"routes": {
  "file": "routes.ts",
  "prefix": "/your-prefix"
}
```

The prefix is extracted from your routes file.

### Packages

The script analyzes all JavaScript/TypeScript files to find external package dependencies:

```json
"packages": [
  "package-name-1",
  "package-name-2"
]
```

Note: The script filters out common packages and those that are already part of RedwoodSDK.

### Environment Variables

If your addon includes an `env.example` file, the script will extract environment variables:

```json
"env": [
  "API_KEY",
  "SECRET_TOKEN"
]
```

### Tailwind CSS

The script automatically detects if your addon requires Tailwind CSS:

```json
"tailwindcss": {
  "required": true
}
```

Tailwind is detected as required if:
- Your addon uses ShadCN UI components (which always require Tailwind)
- Your CSS files contain `@apply` directives (which are Tailwind-specific)

### ShadCN Components

The script detects ShadCN UI components used in your addon:

```json
"shadcn": {
  "required": true,
  "components": [
    "button",
    "input",
    "dialog",
    "dropdown-menu"
  ]
}
```

ShadCN components are detected by analyzing:
- Import statements with paths containing `components/ui/`
- Import statements with paths containing `@/components/ui/` or `@/app/components/ui/`
- Relative imports with `./components/ui/` or `../components/ui/`
- Direct JSX usage of component names

Note: When ShadCN components are detected, Tailwind CSS is automatically marked as required.

### Styles

If your addon includes CSS files, the script will add:

```json
"styles": {
  "source": "src/app/addons/your-addon/styles.css",
  "injectInto": "src/app/styles.css",
  "injectDirective": "@import './addons/your-addon/styles.css';"
}
```

### Post-Install Message

```json
"postInstallMessage": "✅ your-addon add-on installed successfully."
```

## Advanced Configuration

### ShadCN Component Detection

The script detects ShadCN components by:

1. Checking if a `components/ui` directory exists in the project
2. Finding all available ShadCN components in that directory
3. Scanning all JS/TS files in your addon for imports of these components
4. Checking for direct JSX usage of these components

The script uses multiple detection methods to ensure it catches all component usages:
- Regular expression matching for import statements
- Line-by-line analysis for complex import patterns
- JSX element detection

### Package Filtering

The script filters out unnecessary packages to keep your addon's dependencies minimal:

- Common packages already included in RedwoodSDK
- Packages that are part of the ShadCN UI ecosystem when ShadCN is detected

## Troubleshooting

If your addon's configuration is not generated correctly:

1. **Missing ShadCN Components**: Make sure your imports use one of the supported path formats:
   - `@/app/components/ui/component-name`
   - `@/components/ui/component-name`
   - `./components/ui/component-name`
   - `../components/ui/component-name`

2. **Missing Environment Variables**: Check that your `env.example` file follows the format:
   ```
   VARIABLE_NAME=example_value
   ```

3. **Missing Routes**: Ensure your routes file is named correctly (`routes.ts`, `routes.tsx`, `routes.js`, or `routes.jsx`) and is in the addon's root directory.

4. **Missing Packages**: The script only detects non-relative imports. If a package is missing, check that it's imported using the standard import syntax.

## Manually Editing the Configuration

After the script generates the `addon.jsonc` file, you can manually edit it to add or modify any configuration options that weren't automatically detected.
