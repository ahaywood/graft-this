# Windsurf Tool for Redwood SDK

This tool helps you set up Windsurf configuration in your Redwood project.

## Features

- Creates a `.windsurf` directory in your project root
- Sets up default rules for code quality checks
- Provides workflow templates for pre-commit and PR checks

## Installation

Run the following command in your Redwood project:

```bash
npx rwsdk-tools windsurf
```

## What It Does

When you run the tool, it will:

1. Create a `.windsurf` directory in your project root (if it doesn't already exist)
2. Copy the default rules to the `.windsurf/rules` directory
3. Copy the workflow templates to the `.windsurf/workflows` directory

## Default Rules

The tool includes several default rules for code quality:

- `no-console-log`: Warns about console.log statements in production code
- `no-todo-comments`: Flags TODO comments that should be addressed
- `require-alt-text`: Ensures images have alt text for accessibility

You can customize these rules by editing the files in the `.windsurf/rules` directory.

## Workflows

The tool includes workflow templates for:

- **Pre-Commit Checks**: Runs lint, type checking, and custom rules before committing
- **PR Checks**: Runs test coverage, build checks, and security scans for pull requests

You can customize these workflows by editing the files in the `.windsurf/workflows` directory.

## Customization

After installation, you can customize the Windsurf configuration by:

1. Editing the rule files in `.windsurf/rules`
2. Modifying the workflow templates in `.windsurf/workflows`
3. Adding new rules or workflows as needed

## Documentation

For more information on using Windsurf, refer to the Windsurf documentation.
