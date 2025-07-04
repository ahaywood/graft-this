# Component Generators

This project uses [Plop](https://plopjs.com/) to generate and restructure React components. The generators are configured in `plopfile.mjs` and use templates from `plop-templates/component/`.

First, you'll need to install plop:

```bash
npm i -D plop
```

Add the following commands to the `scripts` section of your `package.json` file:

```json
"scripts" : {
  ...
  "plop": "plop",
  "component": "plop component",
  "restructure": "plop restructure",
  "restructure-all": "plop restructure-all"
}
```

## Available Commands

```bash
# Create a new component (interactive prompts)
pnpm component

# Restructure a single component
pnpm restructure

# Restructure all components in a directory
pnpm restructure-all
```

## Command-line Flags

You can use flags to bypass the interactive prompts when creating components:

```bash
# Basic component with folder structure (interactive prompts)
pnpm component MyComponent

# Single file component with no stories or tests
pnpm component MyComponent --file

# Single file component with stories but no tests
pnpm component MyComponent --file --stories

# Folder structure with no stories or tests
pnpm component MyComponent --folder --no-stories --no-tests
```

### Available Flags

- `--file`: Create a single file component (no folder structure)
- `--folder`: Create a component with folder structure (default)
- `--stories`: Include Storybook stories file
- `--no-stories`: Exclude Storybook stories file
- `--tests`: Include test file
- `--no-tests`: Exclude test file

## Component Structure

Each component is structured as:

```
ComponentName/
├── ComponentName.tsx      # Main component file
├── ComponentName.stories.tsx  # Storybook stories
├── ComponentName.test.tsx     # Test file
└── index.ts              # Barrel file for exports
```

## Templates

Component templates are located in `plop-templates/component/`:

- `component.hbs` - Base component template
- `stories.hbs` - Storybook stories template
- `test.hbs` - Test file template
- `index.hbs` - Barrel file template

You can modify these templates to match your preferred component structure and patterns.

## Usage Examples

1. Create a new component:

```bash
pnpm component
# Enter component name when prompted
```

2. Restructure an existing component:

```bash
pnpm restructure
# Enter component name when prompted
```

3. Restructure all components in a directory:

```bash
pnpm restructure-all
# Enter directory path relative to src/app/components when prompted
# Example: for src/app/components/ui, just enter "ui"
```
