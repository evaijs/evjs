# Walkthrough

## Stage 1: Client-First SPA — Complete ✅

### What was built

`@evai/runtime` — a thin React framework over TanStack Router (code-based routing) and React Query.

**Core package** (`packages/runtime/`):
- `src/client/create-app.tsx` — `createApp()` factory that wires Router + QueryClient + DOM mount
- `src/client/route.ts` — re-exports of route creation APIs, components, and hooks
- `src/client/index.ts` — client barrel export
- `src/server/index.ts` — server barrel export (stub)
- `src/index.ts` — root barrel re-export

**Example app** (`examples/basic-csr/`):
- Webpack-based client-only SPA with Home, About, and Posts pages
- Imports from `@evai/runtime/client`

## Stage 2: React Server Functions (Data/AJAX) — Complete ✅

### What was built

Implemented a custom server function mechanism for Webpack that allows calling async functions on the server from the client via JSON-RPC.

**Custom Webpack Tooling**:
- [server-fn-loader.ts](file:///Users/xusd320/Codes/github/evai/packages/runtime/src/webpack/server-fn-loader.ts) — A Webpack loader that detects `"use server"` directives and transforms files:
    - **Client**: Replaces original code with fetch-based RPC stubs.
    - **Server**: Keeps original code and appends registration calls to the server registry.

**Core Runtime Support**:
- [rpc.ts](file:///Users/xusd320/Codes/github/evai/packages/runtime/src/client/rpc.ts) — Client-side helper `__evai_rpc` that sends POST requests to `/api/rpc`.
- [handler.ts](file:///Users/xusd320/Codes/github/evai/packages/runtime/src/server/handler.ts) — Server-side request handler that dispatches RPC calls to registered functions.

**Example app** (`examples/basic-server-fns/`):
- Demonstrates used of `"use server"` directive.
- Uses a multi-compiler Webpack setup (Client + Server).
- Provides a Node.js server that handles both static files and RPC requests.

### Package exports updated

```json
{
  ".":        { "types": "./esm/index.d.ts",        "import": "./esm/index.js" },
  "./client": { "types": "./esm/client/index.d.ts",  "import": "./esm/client/index.js" },
  "./server": { "types": "./esm/server/index.d.ts",  "import": "./esm/server/index.js" },
  "./webpack/server-fn-loader": { "types": "./esm/webpack/server-fn-loader.d.ts", "default": "./esm/webpack/server-fn-loader.js" }
}
```

### Validation

- **Automated**: `npm run build` in `@evai/runtime` followed by `npm run build` in `examples/basic-server-fns`. Both pass.
- **Manual**: Checked `bundle.js` (client) and `server.js` (server) output.
    - Client bundle contains: `return (0,_evai_runtime_client__WEBPACK_IMPORTED_MODULE_0__.__evai_rpc)("api_users_server__getUsers", args);`
    - Server bundle contains original function + `registerServerFn("api_users_server__getUsers", getUsers);`

## Key decisions

| Decision | Rationale |
|----------|-----------|
| Package name `@evai/runtime` | Reflects broader scope beyond routing — includes rendering, data fetching, and future SSR |
| Custom `"use server"` loader | TanStack Start's `createServerFn` is Vite-only. Built a Webpack-native version to maintain Webpack support. |
| Relative paths in artifacts | Ensures portability and ease of use within the repo. |
