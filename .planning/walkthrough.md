# Walkthrough — Client-Only Router Framework

## What was built

A minimal framework skeleton in `@evai/shell` that wraps **TanStack Router** (code-based routing) and **React Query** behind an opinionated `createApp()` API.

## Files created

**Custom Webpack Tooling** (`packages/webpack-plugin/`):
- [server-fn-loader.ts](file:///Users/xusd320/Codes/github/evai/packages/webpack-plugin/src/server-fn-loader.ts) — A Webpack loader that detects `"use server"` directives and transforms files:
    - **Client**: Replaces original code with fetch-based RPC stubs.
    - **Server**: Keeps original code and appends registration calls to the server registry.

**Core Runtime Support** (`packages/runtime/`):
- [rpc.ts](file:///Users/xusd320/Codes/github/evai/packages/runtime/src/client/rpc.ts) — Client-side helper `__evai_rpc` that sends POST requests to `/api/rpc`.
- [handler.ts](file:///Users/xusd320/Codes/github/evai/packages/runtime/src/server/handler.ts) — Server-side request handler that dispatches RPC calls to registered functions.

**Example app** (`examples/basic-server-fns/`):
- Demonstrates used of `"use server"` directive.
- Uses a multi-compiler Webpack setup (Client + Server).
- Uses `@evai/webpack-plugin/server-fn-loader` for transforms.
- Provides a Node.js server that handles both static files and RPC requests.

### Package exports updated

**@evai/runtime**:
```json
{
  ".":        { "types": "./esm/index.d.ts",        "import": "./esm/index.js" },
  "./client": { "types": "./esm/client/index.d.ts",  "import": "./esm/client/index.js" },
  "./server": { "types": "./esm/server/index.d.ts",  "import": "./esm/server/index.js" }
}
```

**@evai/webpack-plugin**:
```json
{
  ".": { "types": "./esm/index.d.ts", "import": "./esm/index.js" },
  "./server-fn-loader": { "types": "./esm/server-fn-loader.d.ts", "default": "./esm/server-fn-loader.js" }
}
```

## Consumer usage

```tsx
import {
  createApp,
  createRootRoute,
  createRoute,
  Outlet,
  Link,
} from "@evai/shell";

const rootRoute = createRootRoute({
  component: () => (
    <div>
      <nav><Link to="/">Home</Link></nav>
      <Outlet />
    </div>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => <h1>Welcome</h1>,
});

const routeTree = rootRoute.addChildren([indexRoute]);

const app = createApp({ routeTree });
app.render("#app");
```

## Verification

```
$ npm run check-types

• turbo 2.8.13
• Packages in scope: @evai/shell
• Running check-types in 1 packages

@evai/shell:check-types: > tsc --noEmit

 Tasks:    1 successful, 1 total
```
