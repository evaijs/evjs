# Architecture

## Overview

`evjs` is a zero-config React meta-framework with type-safe routing (TanStack Router), data fetching (TanStack Query), and server functions (`"use server"`). It uses a Hono-based API server and is designed to be bundler-agnostic.

```mermaid
flowchart TD
    subgraph build["🔨 Build"]
        C[cli] --> P[webpack-plugin]
        BT[build-tools] --> P --> M[manifest]
    end
    M --> client & server
    subgraph client["🖥️ Client"]
        CR[Router] ~~~ CQ[Query]
        CS[__fn_call] --> CT[Transport]
    end
    subgraph server["⚙️ Server"]
        SH[Hono] --> SCH[handler] --> SR[registry]
    end
    CT -.->|POST /api/fn| SH
    style build fill:#1a1a2e,stroke:#16213e,color:#e0e0e0
    style client fill:#0f3460,stroke:#16213e,color:#e0e0e0
    style server fill:#533483,stroke:#16213e,color:#e0e0e0
    style C fill:#e94560,stroke:#e94560,color:#fff
    style M fill:#f5a623,stroke:#f5a623,color:#1a1a2e
```

## Package Dependency Graph

```mermaid
flowchart TD
    cli --> plugin --> bt --> swc
    cli --> webpack
    rt --> hono & router & query
    style cli fill:#e94560,stroke:#e94560,color:#fff
    style plugin fill:#f5a623,stroke:#f5a623,color:#1a1a2e
    style bt fill:#0f3460,stroke:#0f3460,color:#e0e0e0
    style rt fill:#533483,stroke:#533483,color:#e0e0e0
    style swc fill:#2d3436,stroke:#636e72,color:#dfe6e9
    style webpack fill:#2d3436,stroke:#636e72,color:#dfe6e9
    style hono fill:#2d3436,stroke:#636e72,color:#dfe6e9
    style router fill:#2d3436,stroke:#636e72,color:#dfe6e9
    style query fill:#2d3436,stroke:#636e72,color:#dfe6e9
```

## Configuration Flow

```mermaid
flowchart TD
    ec[ev.config.ts] --> dc[defineConfig]
    dc -->|client| html[entry + HtmlPlugin]
    dc -->|server| ewp[EvWebpackPlugin]
    dc -->|middleware| sm[middleware chain]
    dc --> cwc[createWebpackConfig] --> wapi[webpack API]
    style ec fill:#f5a623,stroke:#f5a623,color:#1a1a2e
    style dc fill:#e94560,stroke:#e94560,color:#fff
    style cwc fill:#0f3460,stroke:#0f3460,color:#e0e0e0
    style wapi fill:#2d3436,stroke:#636e72,color:#dfe6e9
    style html fill:#533483,stroke:#533483,color:#e0e0e0
    style ewp fill:#533483,stroke:#533483,color:#e0e0e0
    style sm fill:#533483,stroke:#533483,color:#e0e0e0
```

## Server Function Pipeline

```mermaid
flowchart LR
    src[".server.ts"] --> cb[Client] & sb[Server]
    cb --> cb2["__fn_call(fnId, args)"]
    sb --> sb2["registerServerFn(fnId, fn)"]
    style src fill:#f5a623,stroke:#f5a623,color:#1a1a2e
    style cb fill:#0f3460,stroke:#0f3460,color:#e0e0e0
    style cb2 fill:#0f3460,stroke:#53c8e0,color:#e0e0e0
    style sb fill:#533483,stroke:#533483,color:#e0e0e0
    style sb2 fill:#533483,stroke:#53c8e0,color:#e0e0e0
```

## Build-Tools Structure

```mermaid
flowchart LR
    subgraph src["build-tools/src"]
        codegen & entry & types & utils & idx[index]
        subgraph tx["transforms/"]
            tidx[index] & tutils[utils]
            subgraph cl["client/"]
                cidx[__fn_call stubs]
            end
            subgraph sv["server/"]
                sidx[registerServerFn]
            end
        end
    end
    style src fill:#1a1a2e,stroke:#16213e,color:#e0e0e0
    style tx fill:#0f3460,stroke:#16213e,color:#e0e0e0
    style cl fill:#0f3460,stroke:#53c8e0,color:#e0e0e0
    style sv fill:#533483,stroke:#53c8e0,color:#e0e0e0
    style types fill:#f5a623,stroke:#f5a623,color:#1a1a2e
```

### RUNTIME Constants

All runtime identifiers used in generated code are centralized in `types.ts`:

```ts
export const RUNTIME = {
  serverModule: "@evjs/runtime/server/register",
  appModule: "@evjs/runtime/server",
  clientTransportModule: "@evjs/runtime/client/transport",
  registerServerFn: "registerServerFn",
  clientCall: "__fn_call",
  clientRegister: "__fn_register",
} as const;
```

## Dev Server Architecture

```mermaid
flowchart LR
    browser["🌐 Browser"] -->|:3000| wds[DevServer + HMR]
    wds -->|/api/*| ns[":3001 Node"] --> hono[Hono] --> reg["registry.get(fnId)"]
    style browser fill:#e94560,stroke:#e94560,color:#fff
    style wds fill:#0f3460,stroke:#0f3460,color:#e0e0e0
    style ns fill:#533483,stroke:#533483,color:#e0e0e0
    style hono fill:#533483,stroke:#53c8e0,color:#e0e0e0
    style reg fill:#2d3436,stroke:#636e72,color:#dfe6e9
```

`ev dev` uses the webpack Node API directly:
1. Creates webpack compiler + WebpackDevServer in-process
2. Polls for `dist/manifest.json`
3. Writes a CJS bootstrap and runs it with `node --watch`

## Deployment Adapters

```mermaid
flowchart LR
    subgraph node["Node.js"]
        n1[entry.mjs] --> n2[@hono/node-server]
    end
    subgraph ecma["ECMA"]
        e1[entry.mjs] --> e2[createFetchHandler]
    end
    subgraph sw["Service Worker"]
        sw1[sw.entry.js] --> sw2[fetch listener]
    end
    style node fill:#0f3460,stroke:#16213e,color:#e0e0e0
    style ecma fill:#533483,stroke:#16213e,color:#e0e0e0
    style sw fill:#1a1a2e,stroke:#16213e,color:#e0e0e0
```

## Roadmap

See [ROADMAP.md](./ROADMAP.md) for the full, detailed roadmap.
