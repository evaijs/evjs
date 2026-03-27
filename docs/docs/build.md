# Build

## Command

```bash
ev build
```

Sets `NODE_ENV=production` and produces optimized bundles.

## Output Structure

```
dist/
├── manifest.json           # Server function registry + client asset map
├── client/
│   ├── index.html          # Generated HTML
│   ├── main.[hash].js      # Client bundle
│   └── [chunk].[hash].js   # Code-split chunks
└── server/
    └── main.js             # Server function bundle (CJS)
```

## What Happens During Build

### Server Function Transform

Files with `"use server"` are automatically processed with dual transforms:

| Side | What happens |
|------|-------------|
| **Client** | Function bodies are replaced with `__fn_call(fnId, args)` RPC stubs |
| **Server** | Original function bodies are preserved + `registerServerFn(fnId, fn)` injected |

Function IDs are stable SHA-256 hashes derived from `filePath + exportName`.

### Build Pipeline

1. `loadConfig(cwd)` — loads `ev.config.ts` or convention-based defaults
2. `createWebpackConfig(config, cwd)` — generates webpack config (no temp files)
3. Calls `webpack()` Node API directly
4. `@evjs/webpack-plugin` runs during compilation:
   - Discovers `*.server.ts` files via glob
   - Applies SWC transforms (client + server variants)
   - Runs child compiler for server bundle
   - Emits `dist/manifest.json` with function registry and client assets

## Manifest (`dist/manifest.json`)

The manifest contains both server function mappings and client build metadata:

```json
{
  "version": 1,
  "functions": {
    "a1b2c3d4": { "module": "./api/users.server", "export": "getUsers" }
  },
  "client": {
    "assets": { "js": ["main.abc123.js"], "css": ["styles.def456.css"] },
    "routes": ["/", "/users", "/posts/:id"]
  }
}
```

## Key Points

- Works out of the box with convention-based defaults
- Client bundles use content-hash filenames for cache busting
- Server bundle externalizes `node_modules` (except `@evjs/*` packages)
- No temp config files — webpack is driven via Node API
