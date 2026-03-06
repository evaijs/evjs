# @evjs/manifest

Shared manifest schema types for the ev framework build system.

## Types

- `ServerManifest` — Server manifest interface (`dist/server/manifest.json`).
- `ClientManifest` — Client manifest interface (reserved for future `dist/client/manifest.json`).
- `ServerFnEntry` — `{ moduleId: string; export: string }` — server function metadata.
- `RscEntry` — Reserved for future (React Server Components).
- `PageEntry` — Reserved for future (MPA per-page assets).

## Server Manifest (v1)
```json
{
  "version": 1,
  "entry": "main.a1b2c3d4.js",
  "fns": {
    "<fnId>": { "moduleId": "f9b6...", "export": "getUsers" }
  }
}
```

## Usage
Produced by `@evjs/webpack-plugin`, consumed by `@evjs/runtime` and adapters:
```ts
import type { ServerManifest, ServerFnEntry } from "@evjs/manifest";
```
