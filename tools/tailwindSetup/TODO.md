When setting up Tailwind for a RWSDK project, you need to

1. Run the following command:

```bash
pnpm install -D tailwindcss @tailwindcss/vite
```

2. Update the Vite Plugin (vite.config.mts) to import Tailwind at the top:

```
import tailwindcss from '@tailwindcss/vite'
```

Add an environments config to the `defineConfig` object:

```ts
export default defineConfig({
  environments: {
    ssr: {},
  },
  plugins: [redwood(), tailwindcss()],
});
```

Add the `tailwindcss()` to the `plugins` array:

```ts
export default defineConfig({
  environments: {
    ssr: {},
  },
  plugins: [redwood(), tailwindcss()],
});
```

3. Create a `src/app/styles.css` file with the following content:

```css
@import "tailwindcss";
```

4. Within the `src/app/Document.tsx` file, import the `styles.css` file at the top:

```tsx
import styles from "./styles.css?url";
```

Then, add a `<link>` tag to the `<head>` of the `Document` component:

```tsx
<head>
  <link rel="stylesheet" href={styles} />
</head>
```
