# @evjs/manifest

Shared manifest schema types for the ev framework build system.

## Types

- `EvManifest` — Root manifest interface (versioned, currently v1).
- `ServerFnEntry` — `{ moduleId: string; export: string }` — server function metadata.
- `SsrEntry` — Reserved for Stage 3 (SSR).
- `AssetsEntry` — Reserved for Stage 3 (client JS/CSS assets).
- `RscEntry` — Reserved for future (React Server Components).

## Schema (v1)
```json
{
  "version": 1,
  "serverFns": {
    "<fnId>": { "moduleId": "f9b6...", "export": "getUsers" }
  }
}
```

## Usage
Produced by `@evjs/webpack-plugin`, consumed by `@evjs/runtime`:
```ts
import type { EvManifest, ServerFnEntry } from "@evjs/manifest";
```
