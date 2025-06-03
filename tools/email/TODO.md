When the user runs `npx rwsdk-tools email`, we should:

1. Install `resend`

```bash
pnpm add resend
```

2. Add a variable to the `.env` file:

```
RESEND_API=
```

3. Create a new file called `email.ts` in the `src/app/lib` directory

```typescript
import { Resend } from "resend";
import { env } from "cloudflare:workers";

export const resend = new Resend(env.RESEND_API);
```

4. Ask the user if they want to install react-email. If they say yes, run the following command:

```bash
npx create-email@latest
```