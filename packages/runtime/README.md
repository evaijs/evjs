# @evjs/runtime

Core runtime for the **ev** framework. Provides client-side routing, data fetching, and server-side handling via Hono.

## Installation

```bash
npm install @evjs/runtime
```

## Exports

### `@evjs/runtime/client`

| Export | Description |
|--------|-------------|
| `createApp` | Bootstrap TanStack Router + Query + DOM |
| `useQuery(fn, ...args)` | Smart query hook — accepts server functions directly |
| `useMutation(fn, options?)` | Smart mutation hook — accepts server functions directly |
| `useSuspenseQuery(fn, ...args)` | Smart suspense query hook |
| `initTransport` | One-time transport configuration (endpoint, custom transport, codec) |
| `getFnName` | Get the original name of a server function stub |
| `ServerFunctionError` | Structured error class for server function failures |
| `jsonCodec` | Default JSON codec |
| `createRootRoute`, `createRoute`, `Link`, `Outlet`, ... | Re-exports from `@tanstack/react-router` |
| `useQueryClient`, `QueryClient`, ... | Re-exports from `@tanstack/react-query` |

### `@evjs/runtime/server`

| Export | Description |
|--------|-------------|
| `createApp` | Create a Hono app with server function handler |
| `createHandler` | Standalone Hono sub-app for server function dispatch |
| `dispatch` | Protocol-agnostic dispatcher for custom transports (WebSocket, IPC) |
| `registerMiddleware` | Register middleware for all server function calls |
| `registerServerFn` | Register a server function in the registry |
| `ServerError` | Throwable error with structured data and custom status |
| `jsonCodec` | Default JSON codec |

### `@evjs/runtime/server/node`

| Export | Description |
|--------|-------------|
| `serve` | Start the app on Node.js (default port 3001) |

### `@evjs/runtime/server/ecma`

| Export | Description |
|--------|-------------|
| `createFetchHandler` | Wrap Hono app for Deno, Bun, or any Fetch-compatible runtime |

## Usage

### Client

```tsx
import { createApp, createRootRoute, useQuery, useMutation } from "@evjs/runtime/client";
import { getUsers, createUser } from "./api/users.server";

function Users() {
  const { data } = useQuery(getUsers);
  const { mutate } = useMutation(createUser, {
    invalidates: [getUsers],  // auto-invalidate on success
  });
}

const rootRoute = createRootRoute({ component: Root });
const app = createApp({ routeTree: rootRoute });
app.render("#app");
```

### Server

```ts
import { createApp } from "@evjs/runtime/server";
import { serve } from "@evjs/runtime/server/node";

const app = createApp();
serve(app, { port: 3001 });
```

### Custom Transport

```ts
import { initTransport } from "@evjs/runtime/client";

// Custom endpoint
initTransport({
  baseUrl: "https://api.example.com",
  endpoint: "/server-function",  // default: "/api/fn"
});

// Custom protocol (e.g. WebSocket)
initTransport({
  transport: {
    send: async (fnId, args) => { /* your protocol */ },
  },
});

// Custom serialization
initTransport({
  codec: { serialize: msgpack.encode, deserialize: msgpack.decode, contentType: "application/msgpack" },
});
```

### Server Middleware

```ts
import { registerMiddleware } from "@evjs/runtime/server";

registerMiddleware(async (ctx, next) => {
  console.log(`Calling ${ctx.fnId}`);
  const start = Date.now();
  const result = await next();
  console.log(`${ctx.fnId} took ${Date.now() - start}ms`);
  return result;
});
```

### Typed Errors

```ts
import { ServerError } from "@evjs/runtime/server";

export async function getUser(id: string) {
  const user = db.find(id);
  if (!user) throw new ServerError("User not found", { status: 404, data: { id } });
  return user;
}
```

### Query Patterns

```tsx
// Pass server functions directly — auto-generated key + transport
const { data } = useQuery(getUsers);

// With args
const { data } = useQuery(getUser, userId);

// Mutations with auto-invalidation
const { mutate } = useMutation(createUser, {
  invalidates: [getUsers],
});

// Standard TanStack options also work
const { data } = useQuery({ queryKey: ["custom"], queryFn: fetchSomething });
```

### Custom Transport (WebSocket)

```ts
import { initTransport } from "@evjs/runtime/client";

initTransport({
  transport: {
    send: async (fnId, args) => {
      return new Promise((resolve, reject) => {
        ws.send(JSON.stringify({ id: ++reqId, fnId, args }));
        pending.set(reqId, { resolve, reject });
      });
    },
  },
});
```

## Common Mistakes

1. **Arguments are spread, not wrapped** — `useQuery(getUser, id)` not `useQuery(getUser, [id])`
2. **Mutation args are passed directly** — `mutate({ name, email })` not `mutate([{ name, email }])`
3. **Don't call server functions directly in components** — wrap with `useQuery()` or `useMutation()`
4. **Don't forget `"use server";`** at the top of `.server.ts` files
5. **Throw `ServerError`** on the server, catch `ServerFunctionError` on the client
6. **Always register the router type** — without `declare module "@tanstack/react-router" { ... }`, all route params/search will be `any`
7. **Use `route.useParams()`** not the global `useParams()` — the route-scoped version gives proper type inference
