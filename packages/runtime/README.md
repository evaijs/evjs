# @evjs/runtime

Core runtime for the **ev** framework. It provides isomorphic utilities for client-side routing, state management, and server-side RPC handling via Hono.

## Installation

```bash
npm install @evjs/runtime
```

## Features

- **`createApp`**: A unified factory to bootstrap TanStack Router + Query.
- **Routing**: Re-exports the full power of `@tanstack/react-router`.
- **RPC**: Internal logic for calling `"use server"` functions from the client.
- **Hono Server**: `createServer()` starts a Hono-based API server for RPC.

## Usage

### Client Entry

```tsx
import { createApp, createRootRoute } from "@evjs/runtime";

const rootRoute = createRootRoute({ component: Root });
const app = createApp({ routeTree: rootRoute });

app.render("#app");
```

### Server Entry

```ts
import { createServer } from "@evjs/runtime/server";

createServer(); // Starts Hono-based RPC server on port 3001
```

The Hono server is automatically started and watched by the `ev dev` command. Server functions are auto-discovered by `EvWebpackPlugin` and registered at the `/api/rpc` endpoint — providing a zero-config, low-latency development experience.
