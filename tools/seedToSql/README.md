# Seed to SQL Converter

This tool converts Redwood.js seed files to raw SQL statements. It parses Prisma client operations in your seed files and generates equivalent SQL that can be executed directly against your database.

## Features

- Converts Prisma `create` operations to `INSERT` statements
- Converts Prisma `createMany` operations to multiple `INSERT` statements
- Preserves raw SQL commands from `$executeRawUnsafe`
- Handles nested relations and connections
- Supports TypeScript and JavaScript seed files

## Usage

```bash
node seedToSql.mjs --input <path-to-seed-file> [--output <path-to-output-sql>]
```

### Options

- `--input`, `-i`: Path to the seed file (required)
- `--output`, `-o`: Path to the output SQL file (optional, defaults to input filename with .sql extension)

### Examples

```bash
# Basic usage
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

## Installation

When using this tool through GraftThis, it will be automatically installed with no additional dependencies required.
