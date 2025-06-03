---
description: How to implement and use RedwoodSDK interruptors
---

# RedwoodSDK Interruptors Workflow

This workflow guides you through creating and implementing interruptors (middleware functions) in your RedwoodSDK application.

## 1. Create an interruptors file

Create a dedicated file for your interruptors, typically at `src/app/interruptors.ts`:

```bash
mkdir -p src/app
touch src/app/interruptors.ts
```

## 2. Implement basic authentication interruptors

Add authentication interruptors to your interruptors file:

```tsx
// src/app/interruptors.ts
import { getSession } from "rwsdk/auth";

// Basic authentication interruptor
export async function requireAuth({ request, ctx }) {
  const session = await getSession(request);

  if (!session) {
    return Response.redirect("/login");
  }

  return { ...ctx, session };
}

// Admin-only interruptor
export async function requireAdmin({ request, ctx }) {
  const session = await getSession(request);

  if (!session || !session.isAdmin) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  return { ...ctx, session };
}
```

## 3. Add role-based access control interruptors

Extend your interruptors with role-based access control:

```tsx
// src/app/interruptors.ts - add to existing file
export function hasRole(allowedRoles) {
  return async function hasRoleInterruptor({ request, ctx }) {
    const session = await getSession(request);

    if (!session) {
      return Response.redirect("/login");
    }

    if (!allowedRoles.includes(session.role)) {
      return Response.json({ error: "Unauthorized" }, { status: 403 });
    }

    return { ...ctx, session };
  };
}

// Create specific role-based interruptors
export const isAdmin = hasRole(["ADMIN"]);
export const isEditor = hasRole(["ADMIN", "EDITOR"]);
export const isUser = hasRole(["ADMIN", "EDITOR", "USER"]);
```

## 4. Implement utility interruptors

Add common utility interruptors:

```tsx
// src/app/interruptors.ts - add to existing file
// Logging interruptor
export async function logRequests({ request, ctx }) {
  const start = Date.now();
  console.log(`${request.method} ${request.url} - Started`);
  
  // Add a function to the context that will log when called
  ctx.logCompletion = (response) => {
    const duration = Date.now() - start;
    const status = response.status;
    console.log(`${request.method} ${request.url} - ${status} (${duration}ms)`);
  };
  
  return ctx;
}

// Rate limiting interruptor
export function rateLimit(limit, windowMs = 60000) {
  const requests = new Map();
  
  return async function rateLimitInterruptor({ request, ctx }) {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();
    
    // Clean up old entries
    for (const [key, timestamp] of requests.entries()) {
      if (now - timestamp > windowMs) {
        requests.delete(key);
      }
    }
    
    // Check if IP has exceeded limit
    const count = Array.from(requests.entries())
      .filter(([key, timestamp]) => key.startsWith(ip) && now - timestamp < windowMs)
      .length;
    
    if (count >= limit) {
      return Response.json(
        { error: "Too many requests" },
        { 
          status: 429,
          headers: { "Retry-After": Math.ceil(windowMs / 1000).toString() }
        }
      );
    }
    
    // Add this request to the map
    requests.set(`${ip}:${now}`, now);
    return ctx;
  };
}
```

## 5. Create input validation interruptors with Zod

Add validation interruptors using Zod:

```tsx
// src/app/interruptors.ts - add to existing file
import { z } from "zod";

// Create a reusable validator interruptor
export function validateInput(schema) {
  return async function validateInputInterruptor({ request, ctx }) {
    try {
      const data = await request.json();
      ctx.data = schema.parse(data);
      return ctx;
    } catch (error) {
      return Response.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
  };
}

// Example schemas
export const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  age: z.number().min(18).optional(),
});

// Example validation interruptors
export const validateUser = validateInput(userSchema);
```

## 6. Use interruptors in your routes

Apply your interruptors to routes:

```tsx
// src/app/pages/admin/routes.ts
import { route } from "rwsdk/router";
import { isAdmin, logRequests, validateUser } from "@/app/interruptors";

import { AdminDashboard } from "./AdminDashboard";
import { UserManagement } from "./UserManagement";

export const routes = [
  route("/", [isAdmin, logRequests, AdminDashboard]),
  route("/users", [isAdmin, logRequests, validateUser, UserManagement]),
];
```

## 7. Compose multiple interruptors

Create more complex validation chains by composing interruptors:

```tsx
// src/app/api/users/routes.ts
import { route } from "rwsdk/router";
import { 
  requireAuth, 
  validateUser, 
  rateLimit,
  logRequests 
} from "@/app/interruptors";

// Create a rate limiter for API endpoints
const apiRateLimit = rateLimit(100, 60000); // 100 requests per minute

export const routes = [
  route("/api/users", [
    logRequests,
    apiRateLimit,
    requireAuth,
    validateUser,
    async ({ request, ctx }) => {
      // Handler receives validated data and session from interruptors
      const newUser = await db.user.create({
        data: {
          ...ctx.data,
          createdBy: ctx.session.userId,
        },
      });

      // Log completion with timing information
      ctx.logCompletion(Response.json(newUser, { status: 201 }));
      
      return Response.json(newUser, { status: 201 });
    },
  ]),
];
```

## 8. Testing your interruptors

Create tests for your interruptors:

```tsx
// src/app/interruptors.test.ts
import { describe, it, expect, vi } from 'vitest';
import { requireAuth, validateUser, userSchema } from './interruptors';

describe('Authentication interruptors', () => {
  it('requireAuth redirects unauthenticated users', async () => {
    // Mock request and context
    const request = new Request('https://example.com');
    const ctx = {};
    
    // Mock getSession to return null (unauthenticated)
    vi.mock('rwsdk/auth', () => ({
      getSession: vi.fn().mockResolvedValue(null)
    }));
    
    const result = await requireAuth({ request, ctx });
    
    // Check if it's a redirect response
    expect(result.status).toBe(302);
    expect(result.headers.get('Location')).toBe('/login');
  });
});

describe('Validation interruptors', () => {
  it('validateUser passes valid data', async () => {
    // Mock request with valid JSON
    const validData = { name: 'John Doe', email: 'john@example.com', age: 30 };
    const request = new Request('https://example.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validData)
    });
    
    const ctx = {};
    
    // Create a validation interruptor with our schema
    const validator = validateInput(userSchema);
    const result = await validator({ request, ctx });
    
    // Should pass validation and add data to context
    expect(result.data).toEqual(validData);
  });
});
```

## 9. Best Practices

1. **Single Responsibility**: Each interruptor should do one thing well
2. **Composition**: Combine simple interruptors to create complex behavior
3. **Error Handling**: Provide clear error messages and appropriate status codes
4. **Type Safety**: Use TypeScript types for parameters and return values
5. **Testing**: Write unit tests for each interruptor
6. **Performance**: Keep interruptors lightweight and efficient
7. **Organization**: Group related interruptors in dedicated files
