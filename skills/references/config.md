# Configuration (`ev.config.ts`)

## Overview

evjs is **zero-config by default**. Optionally create `ev.config.ts` in the project root to override defaults. The `defineConfig` helper provides full type-safety.

```ts
import { defineConfig } from "@evjs/cli";
export default defineConfig({ /* ... */ });
```

## Defaults

All fields are optional. These are the built-in defaults:

| Setting | Default |
|---------|---------|
| `client.entry` | `./src/main.tsx` |
| `client.html` | `./index.html` |
| `client.dev.port` | `3000` |
| `server.dev.port` | `3001` |
| `server.endpoint` | `/api/fn` |

## Full Reference

```ts
import { defineConfig } from "@evjs/cli";

export default defineConfig({
  client: {
    // ── Entry & HTML ──
    entry: "./src/main.tsx",
    html: "./index.html",

    // ── Dev server ──
    dev: {
      port: 3000,
      open: true,                // Open browser on start
      https: false,              // Enable HTTPS
      historyApiFallback: true,  // SPA routing (rewrites to index.html)
    },

    // ── Transport (how client calls server functions) ──
    transport: {
      baseUrl: "http://localhost:3001", // Override server origin
      endpoint: "/api/fn",             // Must match server.endpoint
    },
  },

  server: {
    // ── Server functions ──
    endpoint: "/api/fn",
    backend: "node",                       // "node" | "bun" | "deno run --allow-net"
    middleware: ["./src/middleware/auth.ts"], // Applied in order

    // ── Dev server ──
    dev: {
      port: 3001,
    },
  },
});
```

## Client Options

### `client.entry`
Path to the client entry point. Must export the `createApp()` call.

### `client.html`
Path to the HTML template. Must contain a mount element (e.g. `<div id="app">`).

### `client.dev`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `port` | `number` | `3000` | Webpack Dev Server port |
| `open` | `boolean` | — | Open browser on start |
| `https` | `boolean` | — | Enable HTTPS |
| `historyApiFallback` | `boolean` | — | Rewrite 404s to `index.html` for SPA routing |

### `client.transport`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `baseUrl` | `string` | — | Override server origin (useful for cross-origin setups) |
| `endpoint` | `string` | `/api/fn` | Path prefix for server function RPC calls |

> [!NOTE]
> In dev mode, the client dev server proxies `/api/*` to the API server automatically, so `baseUrl` is usually not needed.

## Server Options

### `server.endpoint`
The path at which the server handles function RPC calls. Must match `client.transport.endpoint`.

### `server.backend`
The runtime command used to start the server. Supports:

| Value | Behavior |
|-------|----------|
| `"node"` (default) | Uses `--watch` for auto-restart in dev |
| `"bun"` | Passes args as-is |
| `"deno run --allow-net"` | Split on whitespace, extra args forwarded |

> [!WARNING]
> The ECMA adapter (`@evjs/runtime/server/ecma`) only exports a `{ fetch }` handler — it does **not** start a listening server. For `ev dev`, always use `"node"` as the backend. Use ECMA adapters only for production targets like Cloudflare Workers or Deno Deploy.

### `server.middleware`
Array of file paths to middleware modules. Each module should call `registerMiddleware()`:

```ts
// src/middleware/auth.ts
import { registerMiddleware } from "@evjs/runtime/server";

registerMiddleware(async (ctx, next) => {
  console.log(`Calling ${ctx.fnId}`);
  return await next();
});
```

Middleware is imported and applied in array order.

### `server.dev`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `port` | `number` | `3001` | API server port in dev mode |

## Examples

### Minimal (custom ports only)

```ts
import { defineConfig } from "@evjs/cli";

export default defineConfig({
  client: { dev: { port: 4000 } },
  server: { dev: { port: 4001 } },
});
```

### With middleware and Bun backend

```ts
import { defineConfig } from "@evjs/cli";

export default defineConfig({
  server: {
    backend: "bun",
    middleware: [
      "./src/middleware/auth.ts",
      "./src/middleware/cors.ts",
    ],
  },
});
```
