# Server Routes

## Overview

evjs provides programmatic `route()` handlers for creating standard Request/Response REST APIs. Rather than automagical `"use server"` RPC wrappers, route handlers give you full control over HTTP methods, headers, and standard Web `Request`/`Response` objects.

## Usage

Server routes are defined using the `route(path, definition)` factory from `@evjs/server`. You can then mount these routes using `createApp({ routeHandlers: [...] })`.

```ts
// src/api/posts.routes.ts
import { route } from "@evjs/server";

export const postsRoute = route("/api/posts", {
  GET: async (req, { query }) => {
    const limit = Number(query.get("limit")) || 10;
    return Response.json([{ id: 1, title: "Hello World" }]);
  },
  POST: async (req) => {
    const data = await req.json();
    return Response.json({ success: true, data }, { status: 201 });
  },
});
```

### Handler Signature

Each handler receives two arguments:

```ts
(request: Request, context: RouteHandlerContext) => Response | Promise<Response>
```

The `RouteHandlerContext` provides:

| Field | Type | Description |
|-------|------|-------------|
| `params` | `Record<string, string>` | Resolved dynamic route params (e.g. `{ id: "123" }`) |
| `query` | `URLSearchParams` | Parsed URL search params |
| `headers` | `Headers` | Request headers |
| `ctx` | `HonoContext` | Underlying Hono context, for advanced use |

### Path Parameters & Dynamic Routes

Dynamic path parameters use Hono's `:param` syntax. Access them via `params`:

```ts
export const postDetailsRoute = route("/api/posts/:id", {
  GET: async (_req, { params }) => {
    return Response.json({ id: params.id, title: "Post Details" });
  },
  DELETE: async (_req, { params }) => {
    await db.deletePost(params.id);
    return new Response(null, { status: 204 });
  },
});
```

### Middleware

Use the `middleware` option to run logic before handlers. Middleware receives `(request, context, next)` — call `next()` to proceed or return a `Response` to short-circuit.

> [!NOTE]
> Middleware executes independently for each HTTP method. If a route defines GET and POST with middleware, the chain runs separately for each.

```ts
import { route } from "@evjs/server";

const requireAuth = async (req, ctx, next) => {
  const auth = req.headers.get("Authorization");
  if (!auth) return Response.json({ error: "Unauthorized" }, { status: 401 });
  return next();
};

export const protectedRoute = route("/api/protected", {
  middleware: [requireAuth],
  GET: async () => Response.json({ secret: "data" }),
});
```

## Configuration

To serve your routes, provide a server entry point that exports the app.

### 1. Build the App Server

```ts
// src/server.ts
import { createApp } from "@evjs/server";
import { postsRoute, postDetailsRoute } from "./api/posts.routes";

export const app = createApp({
  routeHandlers: [postsRoute, postDetailsRoute],
});
```

### 2. Configure `ev.config.ts`

```ts
import { defineConfig } from "@evjs/cli";

export default defineConfig({
  server: {
    entry: "./src/server.ts",
    dev: { port: 3001 },
  },
});
```

## Built-in Behaviors

- **Auto OPTIONS**: If not explicitly defined, an `OPTIONS` handler is generated with the `Allow` header listing all defined methods.
- **Auto HEAD**: If `GET` is defined but `HEAD` is not, a `HEAD` handler is derived that returns headers only (no body).
- **405 Method Not Allowed**: Any unregistered HTTP method returns `405` with an `Allow` header.

> [!NOTE]
> If you combine `routeHandlers` with `"use server"` Server Functions, `createApp()` handles **both**. Route handlers are mounted first; the framework fallback handles RPC POST requests at `/api/fn`.
