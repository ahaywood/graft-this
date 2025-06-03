---
description: How to implement and use RedwoodSDK middleware
---

# RedwoodSDK Middleware Workflow

This workflow provides step-by-step guidance on implementing and working with middleware in RedwoodSDK applications.

## Creating a New Middleware

1. Create a dedicated middleware file:
```bash
touch api/src/middleware.ts
```

2. Implement your middleware function using the RedwoodSDK pattern:
```typescript
// api/src/middleware.ts
import { defineApp } from '@redwoodjs/sdk'

export default defineApp([
  // Your middleware functions go here
  async ({ ctx, request, headers }) => {
    // Middleware logic
    console.log('Request received:', request.url)
    
    // You can modify the context object
    ctx.customData = 'example'
    
    // Continue to the next middleware or route handler
  }
])
```

## Common Middleware Patterns

### Security Headers Middleware

```typescript
const setSecurityHeaders = () => {
  return ({ headers }) => {
    // Set security headers
    headers.set('X-Content-Type-Options', 'nosniff')
    headers.set('X-Frame-Options', 'DENY')
    headers.set('X-XSS-Protection', '1; mode=block')
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    headers.set('Content-Security-Policy', "default-src 'self'")
  }
}
```

### Authentication Middleware

```typescript
const authMiddleware = async ({ ctx, request, headers }) => {
  try {
    // Get auth token from request
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response('Unauthorized', { status: 401 })
    }
    
    const token = authHeader.split(' ')[1]
    
    // Verify token and get user
    const user = await verifyToken(token)
    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }
    
    // Add user to context
    ctx.user = user
  } catch (error) {
    console.error('Auth middleware error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
```

### CORS Middleware

```typescript
const corsMiddleware = () => {
  return ({ request, headers }) => {
    // Set CORS headers
    headers.set('Access-Control-Allow-Origin', '*')
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers })
    }
  }
}
```

### Logging Middleware

```typescript
const loggingMiddleware = async ({ request }) => {
  const startTime = Date.now()
  
  // Log request
  console.log(`[${new Date().toISOString()}] ${request.method} ${request.url}`)
  
  // Continue processing
  const response = await next()
  
  // Log response time
  const duration = Date.now() - startTime
  console.log(`[${new Date().toISOString()}] Completed in ${duration}ms with status ${response.status}`)
  
  return response
}
```

## Combining Multiple Middleware

```typescript
// api/src/middleware.ts
import { defineApp } from '@redwoodjs/sdk'

export default defineApp([
  // Order matters - middleware runs in sequence
  corsMiddleware(),
  setSecurityHeaders(),
  loggingMiddleware,
  authMiddleware,
  // Route handlers come after middleware
])
```

## Testing Middleware

1. Create a test file for your middleware:
```bash
touch api/src/middleware.test.ts
```

2. Write tests for your middleware:
```typescript
// api/src/middleware.test.ts
import { describe, it, expect, vi } from 'vitest'
import { authMiddleware } from './middleware'

describe('authMiddleware', () => {
  it('should add user to context when token is valid', async () => {
    // Mock dependencies
    const verifyToken = vi.fn().mockResolvedValue({ id: '123', name: 'Test User' })
    
    // Mock request and context
    const request = new Request('https://example.com', {
      headers: { Authorization: 'Bearer valid-token' }
    })
    const ctx = {}
    const headers = new Headers()
    
    // Call middleware
    await authMiddleware({ ctx, request, headers })
    
    // Assert
    expect(ctx.user).toEqual({ id: '123', name: 'Test User' })
  })
  
  it('should return 401 when token is invalid', async () => {
    // Mock dependencies
    const verifyToken = vi.fn().mockResolvedValue(null)
    
    // Mock request and context
    const request = new Request('https://example.com', {
      headers: { Authorization: 'Bearer invalid-token' }
    })
    const ctx = {}
    const headers = new Headers()
    
    // Call middleware
    const response = await authMiddleware({ ctx, request, headers })
    
    // Assert
    expect(response.status).toBe(401)
  })
})
```

## Best Practices

1. **Single Responsibility**: Each middleware function should do one thing well
2. **Error Handling**: Always include proper error handling in middleware
3. **Type Safety**: Use TypeScript interfaces for request, response, and context objects
4. **Performance**: Be mindful of performance implications, especially for middleware that runs on every request
5. **Security**: Follow security best practices when implementing authentication or handling sensitive data
6. **Testing**: Write comprehensive tests for your middleware functions
7. **Documentation**: Document your middleware's purpose, inputs, outputs, and side effects

## Debugging Middleware

To debug middleware issues:

1. Add console logs to your middleware functions
2. Use the RedwoodSDK dev tools to inspect requests and middleware execution
3. Check the server logs for any errors or unexpected behavior
4. Use browser network tools to inspect request/response headers and status codes
