# Client-First Framework Skeleton

- [x] Plan the `@evai/runtime` client framework skeleton
- [x] Implement framework core in `packages/runtime/src/client/`
  - [x] `create-app.tsx` — `createApp()` factory
  - [x] `route.ts` — re-exports of route creation APIs
  - [x] `client/index.ts` — public API barrel export
  - [x] `src/index.ts` — root barrel re-export
- [x] Verify with `tsc --noEmit`

## Stage 2: React Server Functions (Data/AJAX)
- [x] Implement server function mechanism (used like a REST API, returning JSON data)
  - [x] `src/client/rpc.ts` — client-side RPC helper
  - [x] `src/server/handler.ts` — server-side request handler
  - [x] `src/webpack/server-fn-loader.ts` — Webpack loader for `"use server"` transform
  - [x] `src/webpack/plugin.ts` — Webpack plugin to inject RPC runtime
- [x] Implement build/bundler support for server vs client code splitting
- [x] Create `examples/basic-server-fns`

## Stage 3: Server-Side Rendering (SSR)
- [ ] Implement server entry point (`src/server/`)
- [ ] Add `renderToPipeableStream` and HTML streaming
- [ ] Add client hydration
- [ ] Create `examples/basic-ssr`

## Stage 4: React Server Functions (DOM Stream)
- [ ] Implement streaming React DOM from server functions to the client
- [ ] Integrate React flight/stream consumption on the client
