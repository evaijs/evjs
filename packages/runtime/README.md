# @evjs/runtime

Core runtime for the **ev** framework. It provides isomorphic utilities for client-side routing, state management, and server-side RPC handling.

## Installation

```bash
npm install @evjs/runtime
```

## Features

- **`createApp`**: A unified factory to bootstrap TanStack Router + Query.
- **Routing**: Re-exports the full power of `@tanstack/react-router`.
- **RPC**: Internal logic for calling `"use server"` functions from the client.
- **SSR Support**: Server-side request handlers and function registries.

## Usage

### Client Entry

```tsx
import { createApp, createRootRoute } from "@evjs/runtime";

const rootRoute = createRootRoute({ component: Root });
const app = createApp({ routeTree: rootRoute });

app.render("#app");
```

### Server Handler

```ts
import { createHandler } from "@evjs/runtime/server";

// Integration with standard Node.js http or Express
const handler = createHandler();
app.post("/api/rpc", handler);
```
