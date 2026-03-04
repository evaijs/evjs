# Client-First Framework Skeleton (`@evai/runtime`)

Provide a thin framework layer over `@tanstack/react-router` (code-based routing) and `@tanstack/react-query`. The goal is a minimal but opinionated `createApp()` API that wires up the router, query client, and DOM rendering in one call, prioritizing client-centric rendering but laying the groundwork for future SSR support.

## Proposed Changes

### `packages/runtime/src/client/`

#### [NEW] [create-app.ts](file:///Users/xusd320/Codes/github/evai/packages/runtime/src/client/create-app.ts)

The main framework entry point. Exports `createApp(opts)` which:
1. Accepts a `routeTree` (built by the consumer using `createRootRoute` / `createRoute` / `addChildren`)
2. Accepts optional `router` overrides (e.g. `defaultPreload`, `defaultErrorComponent`)
3. Creates a `QueryClient` and a TanStack `Router` internally
4. Returns an object with a `render(elementOrId)` method that calls `ReactDOM.createRoot` and renders `createElement(QueryClientProvider, ..., createElement(RouterProvider, ...))`

```ts
interface CreateAppOptions {
  routeTree: AnyRoute
  router?: Partial<RouterConstructorOptions<...>>  // forwarded overrides
  queryClient?: QueryClientOptions
}

interface App {
  router: AnyRouter
  queryClient: QueryClient
  render(container: string | HTMLElement): void
}
```

#### [NEW] [route.ts](file:///Users/xusd320/Codes/github/evai/packages/runtime/src/client/route.ts)

Convenience re-exports for route creation APIs:
- `createRootRoute`, `createRoute`, `createRootRouteWithContext`
- `Outlet`, `Link`, `linkOptions`
- Common hooks: `useMatch`, `useParams`, `useSearch`, `useNavigate`, `useRouter`, `useRouterState`, `useLoaderData`, `useLoaderDeps`, `useRouteContext`, `useLocation`

#### [NEW] [index.ts](file:///Users/xusd320/Codes/github/evai/packages/runtime/src/client/index.ts)

Barrel export that re-exports everything from `./create-app.ts` and `./route.ts`.

## Stage 2.5: Production Manifest & Stable IDs

To support production builds with hashed filenames, we need stable identifiers for server functions and a manifest to map them to their implementations.

### [Component Name] @evai/webpack-plugin
#### [MODIFY] [server-fn-loader.ts](file:///Users/xusd320/Codes/github/evai/packages/webpack-plugin/src/server/server-fn-loader.ts)
- Generate stable IDs using a hash of the relative module path and export name.
- Pass metadata to the `EvaiWebpackPlugin`.

#### [NEW] [index.ts](file:///Users/xusd320/Codes/github/evai/packages/webpack-plugin/src/index.ts)
- Implement `EvaiWebpackPlugin`.
- Collect server function metadata.
- Emit `evai-manifest.json`.

## Stage 2.6: SWC-based Transformation
Replace regex parsing in the Webpack loader with `@swc/core` for robust AST-based transformations.

### [Component Name] @evai/webpack-plugin
#### [MODIFY] [server-fn-loader.ts](file:///Users/xusd320/Codes/github/evai/packages/webpack-plugin/src/server-fn-loader.ts)
- Use `@swc/core` to parse and transform the source.
- Implement visitor to identify and rewrite exports.
- Maintain stable ID generation logic.

## Stage 2.7: SWC Loader Migration
Replace `ts-loader` with `swc-loader` across the workspace for faster builds.

### [Component Name] Examples (basic-csr, basic-server-fns)
#### [MODIFY] [webpack.config.cjs](file:///Users/xusd320/Codes/github/evai/examples/basic-csr/webpack.config.cjs)
- Replace all occurrences of `ts-loader` with `swc-loader`.
- Configure `swc-loader` with appropriate options (jsc, target, syntax).

#### [MODIFY] [webpack.config.cjs](file:///Users/xusd320/Codes/github/evai/examples/basic-server-fns/webpack.config.cjs)
- Replace all occurrences of `ts-loader` with `swc-loader`.
- Ensure compatibility with `server-fn-loader`.

## Stage 2.8: @evai/cli Implementation
Create a unified CLI for the evai framework to handle scaffolding and common tasks.

### [Component Name] @evai/cli
#### [NEW] [package.json](file:///Users/xusd320/Codes/github/evai/packages/cli/package.json)
- Define `@evai/cli` name and dependencies (`commander`, `execa`, `fs-extra`).
- Register `evai` binary.

#### [NEW] [index.ts](file:///Users/xusd320/Codes/github/evai/packages/cli/src/index.ts)
- Implement command line interface using `commander`.
- Commands: `init`, `dev`, `build`.

#### [NEW] [templates/](file:///Users/xusd320/Codes/github/evai/packages/cli/templates)
- Provide pre-configured templates for CSR and Server Functions.

### [Component Name] @evai/runtime
#### [MODIFY] [handler.ts](file:///Users/xusd320/Codes/github/evai/packages/runtime/src/server/handler.ts)
- Add support for loading the manifest to resolve functions if needed (optional for now, registration works well for eager loads).

---

### `packages/runtime/src/`

#### [MODIFY] [index.ts](file:///Users/xusd320/Codes/github/evai/packages/runtime/src/index.ts)

Re-export `./client/index.ts` so consumers can import from `@evai/runtime` directly for now.

## Verification Plan

### Automated Tests
- Run `npm run check-types` from the repo root (Turborepo orchestrated `tsc --noEmit` on `@evai/runtime`). This validates that all imports from `@tanstack/react-router` and `@tanstack/react-query` resolve correctly and the public API types are coherent.

### Manual Verification
- Build `examples/basic-server-fns` with hashed filenames enabled (`[contenthash]`).
- Verify `evai-manifest.json` is generated.
- Verify that the server can still execute functions using the stable IDs.
