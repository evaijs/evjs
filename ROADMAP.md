# ev Framework — Roadmap

## ✅ Stage 1 — Client-First SPA

- `createApp()` factory (Router + Query + DOM)
- Code-based routing via TanStack Router
- Data fetching via TanStack Query
- CLI: `ev init` / `ev dev` / `ev build`

## ✅ Stage 2 — Server Functions

- `"use server"` directive with auto-discovery
- JSON-based RPC (`{ fnId, args }` → `{ result }`)
- `query()` / `mutation()` proxies for TanStack Query
- Pluggable `ServerTransport` interface
- Multi-runtime: Node.js, Deno, Bun, Workers, Service Worker
- Bundler-agnostic core (`@evjs/build-tools`)

## 🔲 Exploring

- **Server context** _(next up)_: request headers, cookies, auth in server functions
- **Pluggable serialization**: user-provided serialize/deserialize hooks (JSON by default)
- **SSR**: HTML streaming and hydration
- **RSC**: React Server Components via Flight protocol
- **More bundlers**: Vite, Rspack plugins
