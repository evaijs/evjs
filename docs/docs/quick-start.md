# Quick Start

## Create a New Project

```bash
npx @evjs/create-app my-app
cd my-app && npm install
```

## Development

```bash
ev dev
```

Your browser opens to `http://localhost:3000` with hot module replacement. Server functions in `*.server.ts` files are auto-discovered — no config needed.

## Production Build

```bash
ev build
```

## Project Structure

A new evjs project looks like this:

```
my-app/
├── src/
│   ├── main.tsx          # App entry point
│   ├── routes.tsx        # Route definitions
│   └── api/
│       └── *.server.ts   # Server functions
├── index.html            # HTML template
├── ev.config.ts          # Optional config
└── package.json
```

## Packages

| Package | Purpose |
|---------|---------|
| [`@evjs/cli`](https://github.com/evaijs/evjs/tree/main/packages/cli) | CLI + `defineConfig` |
| [`@evjs/create-app`](https://github.com/evaijs/evjs/tree/main/packages/create-app) | Project scaffolding |
| [`@evjs/client`](https://github.com/evaijs/evjs/tree/main/packages/client) | Client runtime (React + TanStack) |
| [`@evjs/server`](https://github.com/evaijs/evjs/tree/main/packages/server) | Server runtime (Hono) |
| [`@evjs/build-tools`](https://github.com/evaijs/evjs/tree/main/packages/build-tools) | Server function transforms |
| [`@evjs/webpack-plugin`](https://github.com/evaijs/evjs/tree/main/packages/webpack-plugin) | Webpack adapter |
| [`@evjs/manifest`](https://github.com/evaijs/evjs/tree/main/packages/manifest) | Shared manifest schema |

## Configuration

evjs works out of the box with zero config. For customization, create an `ev.config.ts`:

```ts
import { defineConfig } from "@evjs/cli";

export default defineConfig({
  client: {
    entry: "./src/main.tsx",
    html: "./index.html",
    dev: { port: 3000 },
  },
  server: {
    functions: { endpoint: "/api/fn" },
    dev: { port: 3001 },
  },
});
```
