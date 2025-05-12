1. Check to see if tailwind has already been installed on the project. (It would have installed the packages `tailwindcss @tailwindcss/vite`). If not, run the command to install Tailwind for me.

```
npx graftthis tailwind
```

2. Install shadcn cli. If the shadcn package is not installed, run the command for me.

```
pnpm dlx shadcn@latest init -y
```

3. Add a `baseUrl` to my `tsconfig.json` file (inside the `compilerOptions` section)

```

{
  "compilerOptions": {
    "baseUrl": ".",
  }
}

4. Add resolve alias config to vite.config.ts:

```ts
import path from "path"

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

5. Now, the user should be able to add components. console.log a message to let them know they can add components in bulk by running:

```
pnpm dlx shadcn@latest add
```

Or a single component:

```
pnpm dlx shadcn@latest add <COMPONENT-NAME>
```

Components will be added to the `src/components/ui` folder.