# @evjs/build-tools

Bundler-agnostic build utilities for the ev framework's server function pipeline.

## API

- `transformServerFile(source, options)` — Transform `"use server"` files. Client: replaces bodies with `__ev_call` stubs. Server: keeps bodies, appends `registerServerFn` calls.
- `generateServerEntry(config, modules)` — Generate server entry source importing all server modules and bootstrapping the Hono app.
- `detectUseServer(source)` — Check if source starts with `"use server"` directive.
- `makeFnId(rootContext, resourcePath, exportName)` — Derive stable SHA-256 function ID.
- `parseModuleRef(ref)` — Parse `"module#exportName"` strings.

## TransformOptions
```ts
interface TransformOptions {
  resourcePath: string;   // Absolute path to source file
  rootContext: string;     // Project root directory
  isServer: boolean;       // true = server build, false = client build
  onServerFn?: (fnId: string, meta: { moduleId: string; export: string }) => void;
}
```

## ServerEntryConfig
```ts
interface ServerEntryConfig {
  appFactory?: string;  // Default: "@evjs/runtime/server#createApp"
  runner?: string;       // E.g. "@evjs/runtime/server#runNodeServer"
  setup?: string[];      // Extra imports for server entry
}
```

## RUNTIME Constants
All identifiers used in generated code:
```ts
RUNTIME.serverModule          // "@evjs/runtime/server"
RUNTIME.clientTransportModule // "@evjs/runtime/client/transport"
RUNTIME.registerServerFn      // "registerServerFn"
RUNTIME.clientCall            // "__ev_call"
RUNTIME.fnIdProp              // "evId"
```

## Usage
This package is consumed by bundler adapters, not application code:
```ts
import { generateServerEntry, transformServerFile, detectUseServer } from "@evjs/build-tools";
```
