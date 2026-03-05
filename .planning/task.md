# @evjs Task List

## Stage 1: Core Framework Skeleton
- [x] Plan the `@evjs/runtime` client framework skeleton
- [x] Implement framework core in `packages/runtime/src/client/`
- [x] Verify with `tsc --noEmit`

## Stage 2: React Server Functions (Data/AJAX)
- [x] Implement SHA-256 stable IDs in `server-fn-loader.ts`
- [x] Implement `EvWebpackPlugin` to emit `manifest.json`
- [x] Refactor loader to use `@swc/core` for transformations
- [x] Migrate workspace to `swc-loader`
- [x] Use project-relative paths in manifest metadata
- [x] Unify webpack loader rules (apply server-fn-loader to all `.tsx?`)

## Stage 2.5: Manifest Schema
- [x] Define versioned manifest schema (v1)
- [x] Extract types into `@evjs/manifest` package
- [x] Reserve interfaces for SSR, RSC, and Assets

## Stage 2.8: ev CLI
- [x] Implement `ev` (init, dev, build)

## Stage 2.9: Unified Release Flow
- [x] Add root `release:alpha` script
- [x] Automate template version sync on publish

## Stage 2.10: Hono Server Integration
- [x] Add `hono` and `@hono/node-server` to `@evjs/runtime`
- [x] Implement `createRpcMiddleware()` with Hono
- [x] Implement `createServer()` factory with configurable `rpcEndpoint`
- [x] Zero-config server function auto-discovery in `EvWebpackPlugin`
- [x] Separate client (webpack-dev-server) and API (Hono) servers
- [x] Add devServer proxy for `/api` → API server

## Stage 3: Server-Side Rendering (SSR)
- [ ] Implement `renderToPipeableStream` and HTML streaming
- [ ] Add client hydration
- [ ] Create `examples/basic-ssr`

## Stage 4: React Server Components (future)
- [ ] RSC support
