# Server Routes

## Overview

evjs provides programmatic `route()` handlers for creating standard Request/Response REST APIs. Rather than automagical `"use server"` RPC wrappers, route handlers give you full control over HTTP methods, headers, and standard Web `Request`/`Response` objects.

## Usage

Server routes are defined using the `route(path, definition)` factory from `@evjs/server`. You can then mount these routes using `createApp({ routeHandlers: [...] })`.

```ts
// src/api/posts.routes.ts
import { route } from "@evjs/server";

export const postsRoute = route("/api/posts", {
  GET: async (req) => {
    const url = new URL(req.url);
    const limit = Number(url.searchParams.get("limit")) || 10;
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
(request: Request, ctx: HonoContext) => Response | Promise<Response>
```

The Hono `Context` (`ctx`) provides:

| API | Description |
|-----|-------------|
| `ctx.req.param()` | All resolved route params as an object (e.g. `{ id: "123" }`) |
| `ctx.req.param("id")` | A single route param by name |
| `ctx.req.raw` | The underlying Web `Request` (same as the first argument) |
| `ctx.header()` | Set response headers |
| `ctx.json()` | Send a JSON response (alternative to `Response.json()`) |

### Path Parameters & Dynamic Routes

Dynamic path parameters use Hono's `:param` syntax. Access them via `params`:

```ts
export const postDetailsRoute = route("/api/posts/:id", {
  GET: async (_req, ctx) => {
    const id = ctx.req.param("id");
    return Response.json({ id, title: "Post Details" });
  },
  DELETE: async (_req, ctx) => {
    const id = ctx.req.param("id");
    await db.deletePost(id);
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

const requireAuth = async (req, next) => {
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
