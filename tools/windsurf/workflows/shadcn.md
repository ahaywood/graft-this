---
description: How to add shadcn/ui to a Redwood SDK project
---

# Adding shadcn/ui to a Redwood SDK Project

This workflow guides you through installing and configuring shadcn/ui components in your Redwood SDK project.

## Prerequisites

- A Redwood SDK project
- Node.js and npm/yarn/pnpm installed

## Installation Steps

1. Install shadcn/ui CLI
   ```bash
   npx shadcn@latest init
   ```
   Or with Yarn:
   ```bash
   yarn dlx shadcn@latest init
   ```
   Or with pnpm:
   ```bash
   pnpm dlx shadcn@latest init
   ```

   During the installation, you'll be asked to select a theme. Choose the one that best fits your project.

2. Configure component paths in `components.json`
   
   After installation, a `components.json` file will be created in your project root. Update the aliases section to use the Redwood SDK folder structure:

   ```json
   "aliases": {
     "components": "@/app/components",
     "utils": "@/app/lib/utils",
     "ui": "@/app/components/ui",
     "lib": "@/app/lib",
     "hooks": "@/app/hooks"
   }
   ```

3. Install TailwindCSS v4 if you haven't already
   
   You can use the `/tailwind` workflow to add TailwindCSS to your project.

4. Add `baseUrl` to your `tsconfig.json`:
   
   ```json
   {
     "compilerOptions": {
       "baseUrl": ".",
       "paths": {
         "@/*": ["./src/*"]
       }
     }
   }
   ```

5. Add resolve alias config to `vite.config.ts` or `vite.config.mts`:
   
   ```typescript
   import path from "path"
   import tailwindcss from "@tailwindcss/vite"
   import react from "@vitejs/plugin-react"
   import { defineConfig } from "vite"
   import { redwood } from "rwsdk/vite";

   export default defineConfig({
     plugins: [react(), tailwindcss(), redwood()],
     environments: {
       ssr: {}, // Required for Tailwind to work properly
     },
     resolve: {
       alias: {
         "@": path.resolve(__dirname, "./src"),
       },
     },
   })
   ```

6. Adding components
   
   You can add components in bulk:
   ```bash
   npx shadcn@latest add
   ```
   
   Or add a specific component:
   ```bash
   npx shadcn@latest add button
   ```
   
   Components will be added to the `src/app/components/ui` folder.

## Important Notes

1. **React Server Components**: By default, all pages and components within Redwood are server components. Most shadcn/ui components require reactivity, so you may need to add `"use client"` to the top of your component files.

2. **lib/utils path**: Even though we defined our `lib/utils` directory in the `components.json` file as `"lib": "@/app/lib"`, it may still install the `lib` folder in the `src` directory. You'll need to manually move the folder to the `app` directory.

3. **Import paths**: When copying and pasting code from the shadcn/ui website, you may need to update the import paths to match your project structure.

## Folder Structure

After installation, your project structure should include:

```
- src/
  - app/
    - components/
      - ui/         # shadcn/ui components
    - lib/
      - utils.ts    # utility functions
```

## Troubleshooting

- If components aren't being styled correctly, ensure TailwindCSS is properly configured.
- If you encounter path resolution issues, check your `tsconfig.json` and `vite.config.ts` alias configurations.
- For import errors, make sure the paths in your component files match the structure defined in `components.json`.

## Further Reading

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [TailwindCSS v4 Documentation](https://tailwindcss.com/docs/installation/using-vite)
