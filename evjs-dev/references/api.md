# evjs API Reference

## Client APIs

### App Bootstrap

```tsx
import { createApp, createRootRoute, createRoute } from "@evjs/runtime";
```

| API | Purpose |
|-----|---------|
| `createApp({ routeTree })` | Bootstrap Router + QueryClient + render to DOM |
| `createAppRootRoute(opts)` | Root route with typed `context.queryClient` |

### Data Fetching

```tsx
import { query, mutation, initTransport } from "@evjs/runtime/client";
```

| API | Purpose |
|-----|---------|
| `query(fn).useQuery(args)` | Data fetching hook (wraps TanStack `useQuery`) |
| `query(fn).queryOptions(args)` | For prefetching, cache, and loaders |
| `query(fn).queryKey()` | Stable query key for invalidation |
| `mutation(fn).useMutation()` | Mutation hook (wraps TanStack `useMutation`) |
| `createQueryProxy({ ...fns })` | Module-level query proxy object |
| `createMutationProxy({ ...fns })` | Module-level mutation proxy object |
| `initTransport(opts)` | Configure transport (baseUrl, endpoint, or custom) |

### Server APIs

```tsx
import { createApp, serve, registerMiddleware } from "@evjs/runtime/server";
import { createFetchHandler } from "@evjs/runtime/server/ecma";
```

| API | Purpose |
|-----|---------|
| `createApp({ endpoint? })` | Hono app with server function handler |
| `serve(app, { port?, host? })` | Node.js HTTP server with graceful shutdown |
| `createFetchHandler(app)` | ECMA adapter for Deno, Bun, and other edge runtimes |
| `createHandler()` | Standalone Hono handler (for custom server setups) |
| `registerServerFn(id, fn)` | Register a server function (called by build tools) |
| `registerMiddleware(fn)` | Register middleware (auth, logging, etc.) |

### Error Types

| Type | Side | Purpose |
|------|------|---------|
| `ServerError` | Server | Throw structured errors with status and data |
| `ServerFunctionError` | Client | Catch typed errors from server functions |

### Transport Interface

Any object implementing the `ServerTransport` interface:

```ts
interface ServerTransport {
  send(fnId: string, args: unknown[]): Promise<unknown>;
}
```

Built-in implementations:
- Default HTTP transport (used when calling `initTransport({ endpoint })`)
- `WebSocketTransport` from `@evjs/runtime/client`

### Codec Interface

```ts
interface ServerCodec {
  serialize(data: unknown): ArrayBuffer | string;
  deserialize(data: ArrayBuffer | string): unknown;
  contentType: string;
}
```

## Build-Tools APIs

```ts
import {
  transformServerModule,
  transformClientModule,
  generateServerEntry,
  detectUseServer,
  makeFnId,
} from "@evjs/build-tools";
```

| API | Purpose |
|-----|---------|
| `transformServerModule(code, moduleRef)` | Transform `.server.ts` for server build |
| `transformClientModule(code, moduleRef)` | Transform `.server.ts` for client build |
| `generateServerEntry(manifest, options)` | Generate server entry file |
| `detectUseServer(code)` | Check if a file has `"use server"` directive |
| `makeFnId(moduleRef, exportName)` | Create deterministic function ID |

## Webpack Plugin

```ts
import { EvWebpackPlugin } from "@evjs/webpack-plugin";
```

Used internally by `@evjs/cli`. Configuration via `ev.config.ts`:

```ts
new EvWebpackPlugin({
  serverFunctionGlob: "**/*.server.{ts,tsx}",
  endpoint: "/api/fn",
  serverEntry: true,
})
```

## Monorepo Commands

```bash
npm run build              # Build all packages + examples
npm run test               # Unit tests (vitest)
npm run test:e2e           # E2E tests (playwright)
npm run dev                # Dev mode (turborepo)
npx biome check --write    # Fix lint/format
npm run release -- <v> <t> # Publish all packages
npm run lint               # Lint check (Biome)
npm run format             # Auto-format (Biome)
npm run check-types        # TypeScript type-check
```
