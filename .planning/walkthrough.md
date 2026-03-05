# Webpack Child Compiler & Zero-Config API Walkthrough

I have successfully integrated the **Webpack Child Compiler** architecture into the `@evjs` framework. This allows for a unified, zero-config build process where the server-side API is automatically discovered and bundled alongside the client application.

## Key Accomplishments

### 1. Zero-Config & Dynamic API Server
- **Dynamic Discovery**: The Webpack plugin now monitors the `src/` directory in real-time. If you add a new `.server.ts` file or a `"use server"` export while `ev dev` is running, the framework instantly detects it.
- **Auto-Rebuild & Restart**: Upon detecting changes, the plugin updates the virtual server entry and triggers a child compilation. The CLI then automatically restarts the Node API server (on port 3001) for a seamless sub-second update.
- **Single Webpack Config**: Developers no longer need to maintain a separate `serverConfig`. A single `webpack.config.cjs` handles both client and server compilations via a child compiler.

### 2. Webpack Plugin Refactor
- **`EvWebpackPlugin`**: Now uses `compilation.createChildCompiler` to spawn a Node-targeted build for server functions.
- **`server-fn-loader`**: Improved to automatically detect whether it's running in a client (proxied) or server (direct) context, eliminating the need for manual `isServer` options.

### 3. CLI Enhancements
- **Startup Resilience**: The CLI now intelligently waits for the server bundle to be emitted to disk before attempting to start the Node.js process.
- **Clean Architecture**: Simplified command implementation for `ev build` and `ev dev`.
- **Template Optimization**: CLI templates are now full-directory symlinks to the monorepo's examples, ensuring 100% parity. The `ev init` command automatically dereferences these links, filters out build artifacts, and syncs framework versions (e.g., `^0.0.1-alpha.5`) in the new project's `package.json`.

## Verification Results

### Build Phase
The `ev build` command correctly produces a dual-output structure:
- `dist/client/`: Optimized web assets.
- `dist/server/`: Node.js API bundle (`index.js`) and the function `manifest.json`.

### Dev Phase
Running `ev dev` now results in a fully functional development environment:
```
Starting development server...
Starting Webpack Dev Server & Node API...
Waiting for API server to boot...
ev server running at http://localhost:3001
[webpack-dev-server] Project is running at: http://localhost:3000/
```

## How to use
Just run `ev dev` or `ev build` in any project with a standard `@evjs` layout. The framework will detect your `.server.ts` files and handle everything else.
