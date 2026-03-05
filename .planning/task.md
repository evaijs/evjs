# @evjs Task List

## Stage 1: Core Framework Skeleton
- [x] Implement framework core in `packages/runtime/src/client/`

## Stage 2: React Server Functions
- [x] `server-fn-loader` with SHA-256 IDs and `@swc/core`
- [x] `EvWebpackPlugin` with manifest emission
- [x] Unified webpack loader rules (all `.tsx?`)

## Stage 2.5: Manifest Schema
- [x] Versioned `manifest.json` (v1) in `@evjs/manifest`
- [x] Reserved SSR, RSC, Assets interfaces

## Stage 2.8–2.9: CLI & Release
- [x] `ev` CLI (init, dev, build)
- [x] `release:alpha` with### Stage 2: Server Functions (RPC)
- [x] Create `@evjs/runtime/server/app.ts` (Hono Server)
- [x] Create `@evjs/runtime/server/index.ts` (API Exports)
- [x] Update `@evjs/manifest` to support mapping functions
- [x] Update `@evjs/webpack-plugin` to generate `manifest.json` and auto-discover functions
- [x] Create CLI template `basic-server-fns`
- [x] Fix RPC Proxy connection errors in dev server

### Stage 2.5: Zero-Config Server Build
- [x] Refactor `EvWebpackPlugin` to use `compilation.createChildCompiler`
- [x] Streamline `ev dev` and `ev build` CLI to use single Webpack command
- [x] Update CLI templates and example apps to remove `serverConfig` and `server.ts`
- [x] Implement internal server entry auto-generation in CLI
- [x] Enable `writeToDisk` for server assets in dev mode

### Stage 2.6: Dynamic Discovery & Watch Mode
- [x] Move `generateServerEntry` logic into `EvWebpackPlugin`
- [x] Add `src/` to `compilation.contextDependencies` in plugin
- [x] Implement smart overwrite for `server-entry.js` to avoid infinite loops
- [x] Clean up redundant discovery logic in `ev` CLI
- [x] Standardize `package.json` scripts in examples/templates
- [x] Prevent `node --watch` from clearing console in `ev dev`
- [x] Restore client build logs while maintaining terminal preservation

### Stage 2.7: Template Maintenance Optimization
- [x] Replace duplicated template files with relative symlinks to examples
- [x] Ensure `ev init` correctly dereferences symlinks during project creation
- [x] Implement version sync for `package.json` in `ev init`

### Stage 3: SSR (Server-Side Rendering) & hydration
- [x] Verify API server boots correctly via Child Compiler
- [x] Ensure RPC proxy correctly routes to port 3001
- [ ] `examples/basic-ssr` (Next Step)

## Stage 4: RSC
- [ ] React Server Components
