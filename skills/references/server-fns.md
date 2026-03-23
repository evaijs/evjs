# Server Functions

## Overview

Server functions let you write backend logic in `.server.ts` files and call them from React components as if they were local functions. The build system transforms them into RPC calls automatically.

## Usage

```ts
// src/api/users.server.ts
"use server";

export async function getUsers() {
  return await db.users.findMany();
}

export async function createUser(name: string, email: string) {
  return await db.users.create({ data: { name, email } });
}
```

**Rules:**
- File must start with `"use server";` directive
- Only **named async function exports** are transformed
- Use `.server.ts` extension or place in `src/api/` directory
- For single-arg mutations: `mutate({ name, email })`
- For multi-arg mutations: `mutate([name, email])`

## Query Patterns

evjs's `useQuery` and `useMutation` accept server functions directly — auto-generating query keys and transport.

### Direct usage (recommended)

```tsx
import { useQuery, useMutation } from "@evjs/runtime/client";
import { getUsers, getUser, createUser } from "../api/users.server";

// Pass server functions directly — key + transport auto-generated
const { data: users } = useQuery(getUsers);
const { data: user } = useQuery(getUser, userId);

// Mutations
const { mutate } = useMutation(createUser);
const { mutate } = useMutation(createUser, {
  invalidates: [getUsers],
});
```

### Raw fetch / non-server functions

For non-server functions, use the standard TanStack Query API directly:

```tsx
const { data } = useQuery({
  queryKey: ["github-user", username],
  queryFn: () => fetch(`https://api.github.com/users/${username}`).then(r => r.json()),
});
```

## Configuration

### Middleware

Middleware wraps server function calls (not HTTP requests):

```ts
import { registerMiddleware } from "@evjs/runtime/server";

registerMiddleware(async (ctx, next) => {
  const start = Date.now();
  const result = await next();
  console.log(`${ctx.fnId} took ${Date.now() - start}ms`);
  return result;
});
```

Register in `ev.config.ts`:
```ts
export default defineConfig({
  server: { middleware: ["./src/middleware/auth.ts"] },
});
```

### Transport & Codec

```tsx
import { initTransport } from "@evjs/runtime/client";

// HTTP (default)
initTransport({ endpoint: "/api/fn" });

// WebSocket
import { WebSocketTransport } from "@evjs/runtime/client";
initTransport({ transport: new WebSocketTransport("ws://localhost:3001/ws") });
```

## Error Handling

```ts
// Server — throw structured errors
import { ServerError } from "@evjs/runtime/server";
throw new ServerError("User not found", { status: 404, data: { id } });

// Client — catch typed errors
import { ServerFunctionError } from "@evjs/runtime/client";
if (e instanceof ServerFunctionError) {
  console.log(e.message, e.status, e.data);
}
```

## Key Points

- Use `useQuery(fn, ...args)` / `useMutation(fn, options?)` for server functions
- Arguments are spread, not wrapped: `useQuery(getUser, id)` not `useQuery(getUser, [id])`
- `ServerError` on server → `ServerFunctionError` on client (with status + data)
- Middleware receives `(ctx, next)` where `ctx = { fnId, args }` — not a Hono context

