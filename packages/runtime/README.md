# @evjs/runtime

Core runtime for the **ev** framework. It provides isomorphic utilities for client-side routing, state management, and server-side handling via Hono.

## Installation

```bash
npm install @evjs/runtime
```

## Features

- **`createApp`**: A unified factory to bootstrap TanStack Router + Query.
- **Routing**: Re-exports the full power of `@tanstack/react-router`.
- **Server Transport**: Pluggable `ServerTransport` interface for client-server communication.
- **Hono Server**: Runtime-agnostic `createApp()` returns a Hono instance, startable via Runners.

## Usage

### Client Entry

```tsx
import { createApp, createRootRoute, query, mutation } from "@evjs/runtime/client";
import { getUsers, createUser } from "./api/users.server";

function Users() {
  const { data } = query(getUsers).useQuery([]);
  const { mutate } = mutation(createUser).useMutation();
}

const rootRoute = createRootRoute({ component: Root });
const app = createApp({ routeTree: rootRoute });
app.render("#app");
```

### Server

The server app is a runtime-agnostic Hono instance. Use a Runner to start it:

```ts
import { createApp, runNodeServer } from "@evjs/runtime/server";

const app = createApp();
runNodeServer(app, { port: 3001 });
```

In development, the `ev dev` command with a configured `runner` in `EvWebpackPlugin` handles this automatically.

### Custom Transport

```ts
import { configureTransport } from "@evjs/runtime/client";

configureTransport({
  transport: {
    send: async (fnId, args) => {
      const { data } = await axios.post("/api/rpc", { fnId, args });
      return data.result;
    },
  },
});
```
