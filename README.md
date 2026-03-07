# evf

[![npm](https://img.shields.io/npm/v/evf?style=flat-square&label=npm)](https://www.npmjs.com/package/evf)
[![DeepWiki](https://img.shields.io/badge/DeepWiki-evaijs%2Fevjs-blue?style=flat-square&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTQgMTkuNXYtMTVBMi41IDIuNSAwIDAgMSA2LjUgMkgxOXYyMEg2LjVhMi41IDIuNSAwIDAgMS0yLjUtMi41eiIvPjxwYXRoIGQ9Ik04IDdoOCIvPjxwYXRoIGQ9Ik04IDExaDgiLz48cGF0aCBkPSJNOCAxNWg1Ii8+PC9zdmc+)](https://deepwiki.com/evaijs/evjs)
[![Vibe Coding](https://img.shields.io/badge/vibe-coding-ff69b4?style=flat-square)](https://en.wikipedia.org/wiki/Vibe_coding)

> **A zero-config React meta-framework with server functions and multi-runtime support.**

**evf** brings type-safe routing, server functions, and pluggable transports together in a single framework. It runs on Node.js, Deno, Bun, and Edge runtimes — all from one codebase.

## 🎯 Our Goal

**Ev**aluation + **Ev**olution + **F**ramework

- **Evaluation** — Run on Node.js, Deno, Bun, and Edge runtimes with the same codebase.
- **Evolution** — Evolving alongside AI tooling to improve the developer experience.
- **Framework** — Type-safe routing, server functions, and pluggable transports built on TanStack and Hono.

## ⚡ Features

- **Zero Config** — `ev dev` / `ev build` work out of the box with no configuration file.
- **Type-Safe Routing** — Built on [TanStack Router](https://tanstack.com/router).
- **Isomorphic Data Fetching** — Powered by [TanStack Query](https://tanstack.com/query).
- **Server Functions** — `"use server"` directive for server-side logic callable as async functions.
- **Dynamic Server Discovery** — Auto-detects server functions at build time.
- **Pluggable Transport** — HTTP, WebSocket, or custom protocols via `ServerTransport`.
- **Pluggable Codec** — JSON by default; swap in MessagePack, Protobuf, or any format.
- **Server Middleware** — Cross-cutting concerns via `registerMiddleware()`.
- **Typed Errors** — Structured error data flows server → client via `ServerError`.
- **Runtime-Agnostic Server** — Hono-based with adapters for Node, Deno, Bun, Edge.
- **Unified CLI** — `ev init`, `ev dev`, `ev build` — scaffold, develop, and deploy.

## 🏗️ Monorepo Structure

| Package | Purpose |
|---------|---------|
| [`packages/evf`](./packages/evf) | CLI + framework config (`defineConfig`, `ev.config.ts`) |
| [`packages/runtime`](./packages/runtime) | Core runtime — client (React) + server (Hono) |
| [`packages/build-tools`](./packages/build-tools) | Bundler-agnostic server function transforms |
| [`packages/manifest`](./packages/manifest) | Shared manifest schema types |
| [`packages/webpack-plugin`](./packages/webpack-plugin) | Webpack adapter for build-tools |
| [`examples/`](./examples) | Starter templates and reference apps |

See [ARCHITECTURE.md](./ARCHITECTURE.md) for diagrams and [AGENT.md](./AGENT.md) for AI-agent guidance.

## 🚀 Quick Start

```bash
# Scaffold a new project
npx evf@alpha init my-app
cd my-app
npm install

# Develop
ev dev

# Build for production
ev build
```

## 🛠️ Development

Monorepo managed with [Turborepo](https://turbo.build/repo) and npm workspaces.

```bash
npm install          # Install all dependencies
npm run build        # Build all packages + examples
npm run test         # Run unit tests
npm run test:e2e     # Run e2e tests (Playwright)
npm run dev          # Start dev mode
```

## 📄 License

MIT © [xusd320](https://github.com/xusd320)
