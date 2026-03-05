# @evjs/manifest

Shared manifest schema types for the **ev** framework build system.

## Installation

```bash
npm install @evjs/manifest
```

## Purpose

Defines the structure of `manifest.json` emitted by `@evjs/webpack-plugin` and consumed by `@evjs/runtime`. Provides a single source of truth for the build manifest schema.

## Schema (v1)

```json
{
  "version": 1,
  "serverFns": {
    "<fnId>": {
      "moduleId": "f9b6...",
      "export": "getUsers"
    }
  }
}
```

## Exported Types

- **`EvManifest`** — the root manifest interface (versioned).
- **`ServerFnEntry`** — server function metadata (current).
- **`SsrEntry`** — SSR configuration (reserved for Stage 3).
- **`AssetsEntry`** — client JS/CSS assets (reserved for Stage 3).
- **`RscEntry`** — React Server Components (reserved for future).
