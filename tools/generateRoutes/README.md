# Route Generator

A utility script that automatically generates the `links.ts` file by scanning your [RedwoodSDK](https://rwsdk.com) application's routes.

## Location

This script should live in the `other/` directory of your RedwoodSDK project:

```
your-project/
├── src/
│   ├── app/
│   │   └── shared/
│   │       └── links.ts  <- Generated file
│   └── worker.tsx
└── scripts/
    └── generateRoutes.ts <- This script
```

## Features

- Extracts routes from `worker.tsx` and imported route files
- Handles multiple route definition styles:
  - Regular routes: `route("/path", [Component])`
  - Index routes: `index(() => ...)`
  - Prefixed routes: `prefix("/admin", [...])`
  - Imported routes: `[...userRoutes]`
- Preserves dynamic parameters (e.g., `:id`)
- Automatically removes duplicates
- Generates a type-safe `links.ts` file

## Usage

1. Make the script executable:

```bash
chmod +x other/generateRoutes.ts
```

2. Run the script:

```bash
npx tsx other/generateRoutes.ts
```

The script will:

1. Read your `worker.tsx` file
2. Find all route definitions
3. Follow imports to find additional routes
4. Generate/update `src/app/shared/links.ts`

## Example

Given a `worker.tsx` with routes like:

```tsx
render(Document, [
  index(() => new Response("Hello, World!")),
  prefix("/admin", [
    route("/dashboard", [DashboardPage]),
    route("/contacts/:id", [ContactsPage]),
  ]),
  [...userRoutes], // from auth/routes.ts
]);
```

The script will generate a `links.ts` file:

```tsx
import { defineLinks } from "@redwoodjs/sdk/router";

export const link = defineLinks([
  "/",
  "/admin/dashboard",
  "/admin/contacts/:id",
  "/login", // from userRoutes
  "/logout", // from userRoutes
]);
```

## Error Handling

- The script will warn if it cannot process an imported route file
- Invalid route definitions will be skipped
- File read/write errors will be reported with appropriate error messages
