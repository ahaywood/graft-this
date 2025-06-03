---
description: How to add TailwindCSS v4 to a Redwood SDK project
---

# Adding TailwindCSS v4 to a Redwood SDK Project

This workflow guides you through installing and configuring TailwindCSS v4 in your Redwood SDK project.

## Installation Steps

1. Install Tailwind CSS and the Vite plugin
   ```bash
   npm install tailwindcss @tailwindcss/vite
   ```
   Or with Yarn:
   ```bash
   yarn add tailwindcss @tailwindcss/vite
   ```
   Or with pnpm:
   ```bash
   pnpm add tailwindcss @tailwindcss/vite
   ```

2. Configure the Vite Plugin by updating your `vite.config.mts` file
   ```typescript
   // vite.config.mts
   import { defineConfig } from "vite";
   import tailwindcss from '@tailwindcss/vite'
   import { redwood } from "rwsdk/vite";

   export default defineConfig({
     environments: {
       ssr: {}, // Required for Tailwind to work properly
     },
     plugins: [
       redwood(),
       tailwindcss(),
     ],
   });
   ```

3. Create a `src/app/styles.css` file with the following content:
   ```css
   @import "tailwindcss";
   ```

4. Import your CSS in the `Document.tsx` file by adding these changes:
   ```tsx
   // src/app/Document.tsx
   import styles from "./styles.css?url";
   
   // Then within the <head> section, add:
   <link rel="stylesheet" href={styles} />
   ```

5. Start your development server to see the changes:
   ```bash
   npm run dev
   ```
   Or with Yarn:
   ```bash
   yarn dev
   ```
   Or with pnpm:
   ```bash
   pnpm dev
   ```

## Customizing TailwindCSS

With Tailwind v4, customizations are done directly in the `styles.css` file using `@theme` blocks:

```css
@import "tailwindcss";

@theme {
  --color-primary: #e4e3d4;
  --color-secondary: #3b82f6;
  --font-family-base: 'Inter', sans-serif;
}
```

You can then use these custom properties in your components:

```tsx
<div className="bg-primary text-secondary font-base">
  <h1>Hello World</h1>
</div>
```

## Adding Custom Fonts

To add custom fonts to your Tailwind project:

1. Import the font in your `styles.css` file:
   ```css
   @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
   @import "tailwindcss";
   
   @theme {
     --font-family-base: 'Inter', sans-serif;
   }
   ```

2. Use the font in your components:
   ```tsx
   <h1 className="font-base">Hello World</h1>
   ```

## Recommended Extensions

- Install the [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) extension for VS Code to get autocompletion and syntax highlighting.
