When setting up vitest for a RWSDK project, you need to

1. Run the following commands:

```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom
pnpm add react react-dom
```

2. Add a `vitest.config.ts` file in the root of your project with the following content:

```ts
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@generated': path.resolve(__dirname, './generated'),
        },
    },
    test: {
        environment: 'jsdom',
        setupFiles: ['./src/test/setup.ts'],
        globals: true,
        testTimeout: 10000,
    },
})
```

3. Create a `src/test/setup.ts` file with the following content:

```ts
import '@testing-library/jest-dom'

// Set up global test environment
global.ResizeObserver = global.ResizeObserver || class ResizeObserver {
    constructor() { }
    observe() { }
    unobserve() { }
    disconnect() { }
}

4. Your test files will typically need to include:
```ts
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

```
