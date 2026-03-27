# Configuration

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
| `server.functions.endpoint` | `/api/fn` |

## Full Reference

```ts
import { defineConfig } from "@evjs/cli";

export default defineConfig({
  client: {
    // ── Entry & HTML ──
    entry: "./src/main.tsx",
    html: "./index.html",

    // ── Plugins ──
    plugins: [
      {
        name: "tailwind",
        module: {
          rules: [
            { test: /\.css$/, use: ["style-loader", "css-loader", "postcss-loader"] },
          ],
        },
      },
    ],

    // ── Dev server ──
    dev: {
      port: 3000,
      https: false,
    },
  },

  server: {
    // ── Entry ──
    entry: "./src/server.ts",        // Explicit server entry (optional)

    // ── Backend ──
    backend: "node",                 // "node" | "bun" | "deno run --allow-net"

    // ── Server functions ──
    functions: {
      endpoint: "/api/fn",           // Server function RPC endpoint
    },

    // ── Plugins ──
    plugins: [],                     // Same interface as client plugins

    // ── Dev server ──
    dev: {
      port: 3001,
      https: false,
    },
  },
});
```

## Client Options

### `client.entry`

Path to the client entry point. Must export the `createApp()` call.

### `client.html`

Path to the HTML template. Must contain a mount element (e.g. `<div id="app">`).

### `client.plugins`

Array of `EvPlugin` objects that extend the build pipeline with custom module rules.

```ts
interface EvPlugin {
  name: string;
  module?: {
    rules?: EvModuleRule[];
  };
}

interface EvModuleRule {
  test: RegExp;          // File matching pattern
  exclude?: RegExp;      // Pattern to exclude
  use: EvLoaderEntry | EvLoaderEntry[];
}

type EvLoaderEntry =
  | string
  | { loader: string; options?: Record<string, unknown> };
```

#### Plugin Examples

```ts
// Simple loader
{ name: "css", module: { rules: [{ test: /\.css$/, use: "css-loader" }] } }

// Loader chain (Tailwind CSS)
{ name: "tailwind", module: { rules: [{
  test: /\.css$/,
  use: ["style-loader", "css-loader", "postcss-loader"],
}]}}

// Loader with options (CSS Modules)
{ name: "css-modules", module: { rules: [{
  test: /\.module\.css$/,
  use: [
    "style-loader",
    { loader: "css-loader", options: { modules: true } },
  ],
}]}}

// With exclude pattern
{ name: "svg", module: { rules: [{
  test: /\.svg$/,
  exclude: /node_modules/,
  use: "@svgr/webpack",
}]}}
```

### `client.dev`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `port` | `number` | `3000` | Webpack Dev Server port |
| `https` | `boolean` | `false` | Enable HTTPS |

## Server Options

### `server.entry`

Explicit server entry file. If provided, overrides the auto-generated entry. Use this when you need to mount custom route handlers.

### `server.backend`

The runtime command used to start the server:

| Value | Behavior |
|-------|----------|
| `"node"` (default) | Uses `--watch` for auto-restart in dev |
| `"bun"` | Passes args as-is |
| `"deno run --allow-net"` | Split on whitespace, extra args forwarded |

:::warning

The ECMA adapter (`@evjs/server/ecma`) only exports a `{ fetch }` handler — it does **not** start a listening server. For `ev dev`, always use `"node"` as the backend. Use ECMA adapters only for production targets like Deno or Bun.

:::

### `server.functions`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `endpoint` | `string` | `/api/fn` | Path for server function RPC calls |

### `server.plugins`

Same `EvPlugin` interface as `client.plugins`. Applied to the server bundle.

### `server.dev`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `port` | `number` | `3001` | API server port in dev mode |
| `https` | `boolean` | `false` | Enable HTTPS for the API server |

## Examples

### Minimal (custom ports only)

```ts
import { defineConfig } from "@evjs/cli";

export default defineConfig({
  client: { dev: { port: 4000 } },
  server: { dev: { port: 4001 } },
});
```

### With Tailwind CSS

```ts
import { defineConfig } from "@evjs/cli";

export default defineConfig({
  client: {
    plugins: [{
      name: "tailwind",
      module: {
        rules: [{
          test: /\.css$/,
          use: ["style-loader", "css-loader", "postcss-loader"],
        }],
      },
    }],
  },
});
```
