# Client-First Framework Skeleton

- [x] Plan the `@evai/runtime` client framework skeleton
- [x] Implement framework core in `packages/runtime/src/client/`
  - [x] `create-app.tsx` — `createApp()` factory
  - [x] `route.ts` — re-exports of route creation APIs
  - [x] `client/index.ts` — public API barrel export
  - [x] `src/index.ts` — root barrel re-export
- [x] Verify manifest with hashed production builds

## Stage 2.6: SWC-based Transformation
- [ ] Install `@swc/core` and set up loader
- [ ] Implement SWC-based parser and visitor
- [ ] Implement client-side transformation (body stripping)
- [ ] Implement server-side transformation (registration insertion)
- [x] Verify transformation with example app

## Stage 2.7: SWC Loader Migration
- [x] Install `swc-loader` and uninstall `ts-loader`
- [x] Update `examples/basic-csr/webpack.config.cjs`
- [x] Update `examples/basic-server-fns/webpack.config.cjs`
- [x] Verify both examples build and run correctly

## Stage 2.8: @evai/cli Implementation
- [x] Initialize `packages/cli` with `package.json`
- [x] Add `templates/` directory and copy basic examples
- [x] Implement CLI entry point with `commander`
- [x] Implement `init` command to scaffold new projects
- [x] Implement `dev` command (wraps webpack-dev-server or custom dev loop)
- [x] Implement `build` command (wraps webpack)
- [x] Verify CLI by creating a new project from template

## Stage 2: React Server Functions (Data/AJAX)
- [ ] Implement server function mechanism (used like a REST API, returning JSON data)
- [ ] Implement build/bundler support for server vs client code splitting
- [ ] Create `examples/basic-server-fns`

## Stage 3: Server-Side Rendering (SSR)
- [ ] Implement server entry point (`src/server/`)
- [ ] Add `renderToPipeableStream` and HTML streaming
- [ ] Add client hydration
- [ ] Create `examples/basic-ssr`

## Stage 4: React Server Functions (DOM Stream)
- [ ] Implement streaming React DOM from server functions to the client
- [ ] Integrate React flight/stream consumption on the client
