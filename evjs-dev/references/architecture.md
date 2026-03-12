# evjs Architecture Reference

## Overview

evjs is a zero-config React meta-framework with type-safe routing (TanStack Router), data fetching (TanStack Query), and server functions ("use server"). It uses a Hono-based API server and is designed to be bundler-agnostic.

## System Diagram

```
┌──────────────────────────────────────────────────────┐
│ Build Time                                           │
│                                                      │
│   @evjs/cli             @evjs/build-tools            │
│   (ev dev / build)     (bundler-agnostic core)       │
│        │                     │                       │
│        ▼                     ▼                       │
│   @evjs/webpack-plugin  ← thin adapter              │
│   (EvWebpackPlugin + server-fn-loader)               │
│        │                                             │
│        ▼                                             │
│   @evjs/manifest (manifest.json v1 schema)           │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│ Runtime                                              │
│                                                      │
│   Client (Browser)          Server (Node/Edge/Bun)   │
│   ────────────────          ──────────────────────   │
│   TanStack Router           Hono App (createApp)     │
│   TanStack Query            registerServerFn()       │
│   __ev_call() stubs         createHandler()          │
│   ServerTransport           Runner API               │
└──────────────────────────────────────────────────────┘
```

## Server Function Pipeline

```
Source (.server.ts)
  │
  ├─ Client Build ──▶ transforms/client/
  │                   Replaces function bodies with:
  │                     import { __ev_call } from "@evjs/runtime/client/transport"
  │                     export function getUsers(...args) { return __ev_call(fnId, args) }
  │                     getUsers.evId = fnId
  │
  └─ Server Build ──▶ transforms/server/
                      Keeps original source, prepends:
                        import { registerServerFn } from "@evjs/runtime/server"
                      Appends:
                        registerServerFn(fnId, getUsers)
```

## Build-Tools Structure

```
packages/build-tools/src/
  codegen.ts              SWC parseSync→printSync code emitter
  entry.ts                Server entry generation
  types.ts                Shared types + RUNTIME identifier constants
  utils.ts                detectUseServer, makeFnId, parseModuleRef
  index.ts                Barrel re-exports
  transforms/
    index.ts              Orchestrator: parse → extract → delegate
    utils.ts              extractExportNames (AST traversal)
    client/
      index.ts            buildClientOutput (__ev_call stubs)
    server/
      index.ts            buildServerOutput (registerServerFn + manifest)
```

### RUNTIME Constants

All runtime identifiers used in generated code are centralized in `types.ts`:

```ts
export const RUNTIME = {
  serverModule: "@evjs/runtime/server",
  clientTransportModule: "@evjs/runtime/client/transport",
  registerServerFn: "registerServerFn",
  clientCall: "__ev_call",
  fnIdProp: "evId",
} as const;
```

## Configuration Flow

```
ev.config.ts (optional)
  │
  ▼
defineConfig({ client, server })
  │
  ├─ client.entry, client.html      → webpack entry + HtmlWebpackPlugin
  ├─ client.dev.port                 → WebpackDevServer port
  ├─ server.endpoint                 → EvWebpackPlugin options
  ├─ server.middleware               → server entry middleware
  └─ server.dev.port                 → API server port (dev proxy target)
  │
  ▼
createWebpackConfig() → webpack config object (in-memory, no temp files)
  │
  ▼
webpack Node API (webpack() / WebpackDevServer)
```

## `ev build` Flow

1. `resolveWebpackConfig(cwd)` — loads `ev.config.ts` or uses zero-config defaults
2. `createWebpackConfig(evjsConfig)` — generates webpack config object (no temp files)
3. Calls `webpack()` Node API directly
4. `@evjs/webpack-plugin` runs as a webpack plugin:
   - Discovers `*.server.ts` files via glob
   - Applies SWC transforms (client + server variants)
   - Runs child compiler for server bundle
   - Emits `manifest.json` with server function registry

## `ev dev` Flow

1. Same config resolution as `ev build`
2. Starts `WebpackDevServer` for client (port 3000 default)
3. Uses `afterEmit` hook to detect server bundle
4. Auto-starts Node API server via `@evjs/runtime/server/node`
5. Sets up proxy: `devServer.proxy["/api/fn"] → localhost:3001`
6. Graceful shutdown on process exit

### Dev Server Architecture

```
Browser ──▶ WebpackDevServer (port 3000)
               │
               ├─ Static assets (HMR)
               │
               └─ /api/* ──proxy──▶ Node Server (port 3001)
                                       │
                                       └─ Hono App
                                            └─ POST /api/fn
                                                 └─ registry.get(fnId)(...args)
```

## Manifest (`manifest.json`)

```json
{
  "version": 1,
  "serverFunctions": {
    "getUsers": { "module": "./api/users.server", "export": "getUsers" },
    "createUser": { "module": "./api/users.server", "export": "createUser" }
  }
}
```

## Deployment Adapters

```
┌─ Node.js ──────────────────────────────────┐
│  server.entry.mjs → @hono/node-server      │
└────────────────────────────────────────────┘

┌─ ECMA (Deno/Bun/Workers) ──────────────────┐
│  server.entry.mjs → @evjs/runtime/server/ecma │
│  export default createFetchHandler(app)         │
└────────────────────────────────────────────┘

┌─ Service Worker (browser-offline) ─────────┐
│  swMock.entry.js → self.addEventListener   │
│  Intercepts fetch, routes to Hono app      │
└────────────────────────────────────────────┘
```
