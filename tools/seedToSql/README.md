# Seed to SQL Converter

This tool converts Redwood.js seed files to raw SQL statements. It parses Prisma client operations in your seed files and generates equivalent SQL that can be executed directly against your database.

## Features

- Converts Prisma `create` operations to `INSERT` statements
- Converts Prisma `createMany` operations to multiple `INSERT` statements
- Preserves raw SQL commands from `$executeRawUnsafe`
- Handles nested relations and connections
- Supports TypeScript and JavaScript seed files
- Supports various formatting styles and whitespace variations
- Automatically removes duplicate SQL statements
- Handles the latest RedwoodSDK import formats

## Usage

```bash
node seedToSql.mjs [--input <path-to-seed-file>] [--output <path-to-output-sql>]
```

### Options

- `--input`, `-i`: Path to the seed file (optional, will auto-detect if not specified)
- `--output`, `-o`: Path to the output SQL file (optional, defaults to input filename with .sql extension)

### Default Behavior

If no input file is specified, the tool will automatically look for a seed file at:

`src/scripts/seed.ts`

This is the standard location for seed files in Redwood projects.

### Examples

```bash
# Auto-detect seed file and generate SQL
node seedToSql.mjs

# Basic usage with explicit input
node seedToSql.mjs --input ./seed.ts

# Specify output file
node seedToSql.mjs --input ./seed.ts --output ./migrations/seed.sql

# Short form
node seedToSql.mjs -i ./seed.ts -o ./migrations/seed.sql
```

## Limitations

- Complex JavaScript expressions in seed files may not be fully converted
- Some advanced Prisma features might not be supported
- Date objects are converted to `CURRENT_TIMESTAMP`
- Nested relations (like `create` and `connect`) may not be properly handled in complex scenarios
- Transactions are not automatically added

## Changelog

See the [CHANGELOG.md](./CHANGELOG.md) file for details on recent updates and improvements.

## Installation

When using this tool through GraftThis, it will be automatically installed with no additional dependencies required.

## Troubleshooting

If you encounter any issues:

1. Make sure your seed file follows the standard Redwood.js format
2. Check that your Prisma operations use standard syntax
3. For complex seed files, you may need to manually adjust the generated SQL
4. See the [CHANGELOG.md](./CHANGELOG.md) for recent fixes and improvements
