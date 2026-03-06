# ev Framework — Roadmap

> Living document tracking the evolution of the ev framework from client-first SPA to full-stack React meta-framework.

---

## ✅ Stage 1 — Client-First SPA `(complete)`

Foundation: a zero-config React SPA with type-safe routing and data fetching.

| Deliverable | Status | Notes |
|-------------|--------|-------|
| `createApp({ routeTree })` factory | ✅ | Wires Router + QueryClient + DOM mount |
| Code-based routing via TanStack Router | ✅ | `createRoute`, `createRootRoute`, `Link`, `Outlet` |
| Data fetching via TanStack Query | ✅ | Re-exported hooks: `useQuery`, `useMutation`, etc. |
| `createAppRootRoute` with typed context | ✅ | Provides `queryClient` in route loaders |
| `ev init` / `ev dev` / `ev build` CLI | ✅ | Scaffold, develop, build in one tool |

---

## ✅ Stage 2 — React Server Functions `(complete)`

Goal: call server-side logic from the browser like normal async functions.

| Deliverable | Status | Notes |
|-------------|--------|-------|
| `"use server"` directive detection | ✅ | `detectUseServer()` in build-tools |
| Client transform (RPC stubs) | ✅ | `__ev_call(fnId, args)` + `__ev_register(fn, fnId)` |
| Server transform (registration) | ✅ | `registerServerFn(fnId, fn)` injected at load time |
| Webpack plugin with child compiler | ✅ | Auto-discovers `.server.ts` files, no manual config |
| Manifest schema (`manifest.json` v1) | ✅ | `@evjs/manifest` — versioned, extensible |
| `query()` / `mutation()` proxies | ✅ | Zero-boilerplate TanStack Query integration |
| `createQueryProxy` / `createMutationProxy` | ✅ | Module-level typed proxy objects |
| `configureTransport({ baseUrl, endpoint })` | ✅ | Configurable RPC endpoint |
| Custom `ServerTransport` interface | ✅ | Fully pluggable transport layer |
| Node.js deployment (`@hono/node-server`) | ✅ | `runNodeServer(app, { port })` |
| ECMA adapter (`@evjs/runtime/server/ecma`) | ✅ | `createHandler(app)` for Deno, Bun, Workers |
| Service Worker adapter (`swMock.entry.js`) | ✅ | Runs server functions in the browser |
| Bundler-agnostic `@evjs/build-tools` | ✅ | Pure functions, no Webpack dependency |
| `RUNTIME` constants (codegen identifiers) | ✅ | Single source of truth in `types.ts` |
| Request body validation in RPC handler | ✅ | Returns 400 on malformed `fnId` |
| Parallel E2E tests with dynamic ports | ✅ | Worker-scoped fixtures, no port conflicts |

---

## 🔲 Stage 3 — Production Readiness

Goal: harden the framework for real-world production use cases.

### 3.1 Server Context

**Problem**: Server functions are currently pure — they have no access to the incoming HTTP request (cookies, headers, auth tokens).

**Solution**: Use Node.js `AsyncLocalStorage` to provide an ambient request context.

```ts
// Framework internals (handler.ts)
import { AsyncLocalStorage } from "node:async_hooks";
const requestContext = new AsyncLocalStorage<HonoContext>();

// Inside the RPC handler, wrap the function call:
requestContext.run(c, () => fn(...args));

// Developer land
import { getContext } from "@evjs/runtime/server";
export async function deletePost(id: string) {
  const auth = getContext().req.header("Authorization");
  // ...
}
```

| Task | Priority |
|------|----------|
| Create `AsyncLocalStorage`-based context in `handler.ts` | 🔴 High |
| Export `getContext()`, `getHeaders()`, `getCookies()` helpers | 🔴 High |
| Document the pattern in `runtime/README.md` | 🟡 Medium |

### 3.2 Smart Serialization

**Problem**: `JSON.stringify` drops `Date`, `Map`, `Set`, `BigInt`, `Error`, `undefined`, and circular references.

**Solution**: Integrate a serialization library (`superjson`, `devalue`, or `seroval`) in both the client transport and server handler.

| Task | Priority |
|------|----------|
| Evaluate `superjson` vs `devalue` vs `seroval` | 🟡 Medium |
| Integrate into `createFetchTransport` (client) | 🟡 Medium |
| Integrate into `createRpcMiddleware` (server) | 🟡 Medium |
| Ensure backward compatibility with plain JSON | 🟡 Medium |

### 3.3 Parallel Compilation

**Problem**: The server child compiler runs inside the client's `finishModules` hook, blocking HMR until the server bundle is complete.

**Solution**: Run client and server as parallel sibling compilers (`webpack([clientConfig, serverConfig])`), sharing discovered entry points via an in-memory cache.

| Task | Priority |
|------|----------|
| Extract server module discovery into a shared phase | 🟢 Low |
| Refactor `EvWebpackPlugin` to emit server config separately | 🟢 Low |
| Update `ev dev` to run both compilers in parallel | 🟢 Low |

### 3.4 Error Handling

**Problem**: Server-side errors arrive as `{ error: string }` JSON — no structured error codes, no stack traces in dev, no integration with React Error Boundaries.

| Task | Priority |
|------|----------|
| Define `ServerFunctionError` class with `code`, `message`, `details` | 🟡 Medium |
| Return stack traces in development mode only | 🟡 Medium |
| Client-side: throw typed errors that integrate with Error Boundaries | 🟡 Medium |

---

## 🔲 Stage 4 — Server-Side Rendering (SSR)

Goal: render initial HTML on the server for SEO and fast first paint.

| Task | Priority |
|------|----------|
| `renderToReadableStream` integration | 🔴 High |
| HTML streaming with Suspense boundaries | 🔴 High |
| Client hydration (`hydrateRoot`) | 🔴 High |
| Dehydrate/hydrate TanStack Query state | 🟡 Medium |
| SSR-aware `configureTransport` (direct function call, no HTTP) | 🟡 Medium |
| `ClientManifest` emission for asset injection | 🟡 Medium |
| Update `ev build` to produce SSR entry | 🟢 Low |

---

## 🔲 Stage 5 — React Server Components (RSC)

Goal: support React's `"use client"` / `"use server"` component model with streaming Flight protocol.

| Task | Priority |
|------|----------|
| React Flight protocol integration | 🔴 High |
| `ServerTransport.stream()` implementation | 🔴 High |
| `"use client"` directive detection + boundary splitting | 🔴 High |
| RSC manifest (`rsc` field in `ServerManifest`) | 🟡 Medium |
| Selective hydration | 🟡 Medium |
| RSC + SSR composition | 🟢 Low |

---

## 🔲 Stage 6 — Ecosystem & DX

Goal: polish developer experience and expand the ecosystem.

| Task | Priority |
|------|----------|
| Vite plugin (leverage `@evjs/build-tools`) | 🟡 Medium |
| Rspack plugin | 🟢 Low |
| DevTools browser extension (inspect RPC calls, query cache) | 🟢 Low |
| `ev generate` scaffolding (routes, server functions) | 🟢 Low |
| Official documentation site | 🟡 Medium |
| Middleware system for server functions (logging, rate-limiting) | 🟡 Medium |
