# @evjs/manifest

Shared manifest schema types for the **ev** framework build system.

## Installation

```bash
npm install @evjs/manifest
```

## Purpose

Defines the structure of per-environment manifest files emitted by `@evjs/webpack-plugin` and consumed by `@evjs/runtime`. Each environment gets its own `manifest.json`:

- `dist/server/manifest.json` → `ServerManifest`
- `dist/client/manifest.json` → `ClientManifest` (future)

## Server Manifest (v1)

```json
{
  "version": 1,
  "entry": "main.a1b2c3d4.js",
  "fns": {
    "<fnId>": {
      "moduleId": "f9b6...",
      "export": "getUsers"
    }
  }
}
```

## Exported Types

- **`ServerManifest`** — server manifest (`dist/server/manifest.json`).
- **`ClientManifest`** — client manifest (reserved for future).
- **`ServerFnEntry`** — server function metadata (`{ moduleId, export }`).
- **`RscEntry`** — React Server Components (reserved for future).
- **`PageEntry`** — per-page assets for MPA (reserved for future).
