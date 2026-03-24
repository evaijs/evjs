# Server Routes

## Overview

evjs provides programmatic `route()` handlers for creating standard Request/Response REST APIs. Rather than automagical `"use server"` RPC wrappers, route handlers give you full control over HTTP methods, headers, and standard Web `Request`/`Response` objects.

## Usage

Server routes are defined using the `route(path, definition)` factory from `@evjs/server`. You can then mount these routes using `createApp({ routeHandlers: [...] })`.

```ts
// src/api/posts.routes.ts
import { route } from "@evjs/server";

export const postsRoute = route("/api/posts", {
  GET: async (req, ctx) => {
    return ctx.json([{ id: 1, title: "Hello World" }]);
  },
  POST: async (req, ctx) => {
    const data = await req.json();
    return ctx.json({ success: true, data }, 201);
  }
});
```

### Path Parameters & Dynamic Routes

Dynamic path parameters are defined using the standard Hono syntax (e.g., `/:id`).

```ts
export const postDetailsRoute = route("/api/posts/:id", {
  GET: async (req, ctx) => {
    const id = ctx.req.param("id");
    return ctx.json({ id, title: "Post Details" });
  }
});
```

### Context & Middleware Chaining

Route handlers receive the standard Web `Request` and a `RouteContext` which implements Hono's Context API.
You can chain middleware seamlessly using arrays of handlers. If a middleware handler returns `null`, the chain proceeds to the next handler.

```ts
import { route } from "@evjs/server";

// Simple middleware
const requireAuth = async (req, ctx) => {
  const auth = req.headers.get("Authorization");
  if (!auth) return ctx.json({ error: "Unauthorized" }, 401);
  return null; // Return null to continue to the next handler
};

export const protectedRoute = route("/api/protected", {
  GET: [
    requireAuth,
    async (req, ctx) => {
      return ctx.json({ secret: "data" });
    }
  ]
});
```

## Configuration

To serve your routes, you must provide a server entry point that explicitly exports your app.

### 1. Build the App Server

```ts
// src/server.ts
import { createApp } from "@evjs/server";
import { postsRoute, postDetailsRoute } from "./api/posts.routes";

export const app = createApp({
  routeHandlers: [postsRoute, postDetailsRoute]
});
```

### 2. Configure `ev.config.ts`

Set the `server.entry` to tell the build tools about your custom server file.

```ts
import { defineConfig } from "@evjs/cli";

export default defineConfig({
  server: {
    entry: "./src/server.ts",
    dev: { port: 3001 }
  }
});
```

> [!NOTE]
> If you combine `routeHandlers` with `"use server"` Server Functions, `createApp()` will automatically handle **both**. The `routeHandlers` are mounted first, and the framework fallback handles your RPC POST requests at `/api/fn`.
