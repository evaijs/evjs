---
name: evjs-dev
description: "Use this skill when developing applications with the evjs meta-framework. Triggers on: evjs, ev dev, ev build, ev init, ev.config.ts, defineConfig, server functions, \"use server\", .server.ts, @evjs/runtime, @evjs/cli, TanStack Router with evjs, Hono with evjs, query(), mutation(), createApp, createRoute, initTransport, registerMiddleware, ServerError. Use this skill whenever the user is working on an evjs project, even if they just mention 'ev' commands or server function patterns."
---

# evjs Development Guide

evjs is a zero-config React meta-framework built on TanStack Router + Query and Hono. The CLI command is `ev`.

## Quick Reference

| Item | Value |
|------|-------|
| CLI | `ev dev` / `ev build` / `ev init` |
| Config | `ev.config.ts` (optional, zero-config by default) |
| Linter | Biome (`npx biome check --write`) |
| Build | Turborepo + npm workspaces |
| Test | Vitest (unit) + Playwright (e2e) |
| Module | ESM-only (`"type": "module"`) |

## Package Map

| Package | Purpose |
|---------|---------|
| `@evjs/cli` | CLI (`ev init`, `ev dev`, `ev build`) + `defineConfig` |
| `@evjs/runtime` | Client (React + TanStack) + Server (Hono) |
| `@evjs/build-tools` | Bundler-agnostic SWC transforms |
| `@evjs/manifest` | Shared manifest schema types |
| `@evjs/webpack-plugin` | Webpack adapter wrapping build-tools |

```
@evjs/cli
  ├── @evjs/webpack-plugin
  │     ├── @evjs/build-tools
  │     └── @evjs/manifest
  └── webpack / webpack-dev-server / swc-loader / @swc/core

@evjs/runtime (standalone, no internal deps)
```

## Server Functions

The central mechanism. Files must start with `"use server";` directive.

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
- File must start with `"use server";`
- Only named async function exports are transformed (no default exports, no arrow functions)
- Use `.server.ts` extension or place in `src/api/`
- Auto-discovered at build time — no manual registration needed
- Arguments are positional params, transported as a tuple

**Transform pipeline:**
- Client build strips function bodies → replaces with `__ev_call(fnId, args)` RPC stubs
- Server build keeps bodies → appends `registerServerFn(fnId, fn)` registration

## Client API

```tsx
import { createApp, createRootRoute, createRoute } from "@evjs/runtime";
import { query, mutation, initTransport } from "@evjs/runtime/client";
```

### Data Fetching — always use `query()` / `mutation()` proxies

```tsx
// Hook usage
const { data } = query(getUsers).useQuery();

// With arguments
const { data } = query(getUser).useQuery(userId);

// queryOptions for prefetch / loaders
const opts = query(getUsers).queryOptions();
queryClient.ensureQueryData(opts);

// Cache invalidation
queryClient.invalidateQueries({ queryKey: query(getUsers).queryKey() });

// Mutation with auto-invalidation
const { mutate } = mutation(createUser).useMutation({
  invalidates: [getUsers],
});

// Route loader pattern
const usersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/users",
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(query(getUsers).queryOptions()),
  component: UsersPage,
});
```

### Transport & Codec

```tsx
// HTTP (default)
initTransport({ endpoint: "/api/fn" });

// WebSocket
import { WebSocketTransport } from "@evjs/runtime/client";
initTransport({
  transport: new WebSocketTransport("ws://localhost:3001/ws"),
});

// Custom codec
initTransport({
  codec: {
    serialize: (data) => msgpack.encode(data),
    deserialize: (buffer) => msgpack.decode(buffer),
    contentType: "application/msgpack",
  },
});
```

### Error Handling

```ts
// Server side — throw structured errors
import { ServerError } from "@evjs/runtime";

export async function getUser(id: string) {
  const user = await db.users.find(id);
  if (!user) {
    throw new ServerError("User not found", { status: 404, data: { id } });
  }
  return user;
}

// Client side — catch typed errors
import { ServerFunctionError } from "@evjs/runtime/client";

try {
  const user = await getUser("123");
} catch (e) {
  if (e instanceof ServerFunctionError) {
    console.log(e.message);  // 'Server function "getUser" threw: User not found'
    console.log(e.data);     // { id: "123" }
  }
}
```

## Configuration

Optional — zero-config by default. When needed:

```ts
import { defineConfig } from "@evjs/cli";

export default defineConfig({
  client: {
    entry: "./src/main.tsx",
    html: "./index.html",
    dev: { port: 3000, open: true, historyApiFallback: true },
    transport: { baseUrl: "", endpoint: "/api/fn" },
  },
  server: {
    endpoint: "/api/fn",
    runner: "@evjs/runtime/server/node",
    middleware: ["./src/middleware/auth.ts"],
    dev: { port: 3001 },
  },
});
```

| Default | Value |
|---------|-------|
| `client.entry` | `"./src/main.tsx"` |
| `client.html` | `"./index.html"` |
| `client.dev.port` | `3000` |
| `server.endpoint` | `"/api/fn"` |
| `server.dev.port` | `3001` |
| `server.runner` | `"@evjs/runtime/server/node"` |

## Middleware

Middleware wraps server function calls (not HTTP requests):

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

Reference middleware in config:
```ts
export default defineConfig({
  server: { middleware: ["./src/middleware/auth.ts"] },
});
```

## Common Tasks

### Add a new server function
1. Create `src/api/[name].server.ts` with `"use server";` at top
2. Export named async functions
3. Import and use with `query()` or `mutation()` in routes

### Add a new route
1. Define in `routes.tsx` with `createRoute({ getParentRoute, path, component })`
2. Add to route tree via `parentRoute.addChildren([newRoute])`

### Add a new example
1. Create directory under `examples/`
2. Add `package.json` with `"@evjs/cli": "*"` as devDep, `"private": true`
3. Add `src/main.tsx` + `index.html`
4. Scripts: `"dev": "ev dev"`, `"build": "ev build"`
5. Symlink in `packages/cli/templates/` → `../../../examples/[name]`

### Release
```bash
npm run release -- <version> <tag>
# Example: npm run release -- 0.0.1-rc.7 latest
```

## Critical Rules

1. **ESM only** — all packages use `"type": "module"`. No CommonJS.
2. **Biome** for linting — no `any`, no `import * as`. Run `npx biome check --write .`
3. **No manual webpack configs** — use `ev.config.ts` or zero-config defaults.
4. **No default exports for server functions** — use named async function exports.
5. **Import `defineConfig` from `@evjs/cli`**, not `@evjs/runtime`.
6. **Config file**: named `ev.config.ts` (not `evjs.config.ts`).
7. **Import type** — use `import type` for type-only imports.
8. **Git hooks** — Husky runs `lint` + `check-types` before push.

## File Conventions

| Pattern | Meaning |
|---------|---------|
| `*.server.ts` | Server function file (must have `"use server"` directive) |
| `ev.config.ts` | Framework configuration file |
| `src/main.tsx` | Client entry (keep minimal) |
| `src/routes.tsx` | Route tree + route components |
| `index.html` | HTML template |
| `src/api/` | Conventional location for server function files |
| `src/middleware/` | Conventional location for server middleware |

For detailed architecture diagrams and server API reference, see `references/architecture.md` and `references/api.md`.
