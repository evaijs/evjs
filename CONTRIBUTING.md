# Contributing to evjs

Thanks for your interest in contributing!

---

## Setup

```bash
git clone https://github.com/evaijs/evjs.git
cd evjs
npm install
npm run build     # required — packages depend on each other's output
```

---

## How the Monorepo Works

This is an **npm workspaces** monorepo orchestrated by **Turborepo**. All packages are **ESM-only**.

There are five packages under `packages/`, organized in layers:

```
@evjs/cli                     ← user-facing CLI (ev dev / build / init)
  └─ @evjs/webpack-plugin     ← webpack adapter
       └─ @evjs/build-tools   ← bundler-agnostic SWC transforms (core logic)
            └─ @evjs/manifest ← shared manifest types

@evjs/runtime                 ← standalone: React client + Hono server
```

**Key concept:** the build layer transforms `"use server"` files into RPC stubs (client) and registered handlers (server). The runtime layer provides the client transport and Hono-based server that connects them.

---

## How Server Functions Work

This is the central mechanism of the framework. Understanding it helps with most contributions:

1. Author writes a `.server.ts` file with `"use server";` and named exports
2. **Client build** strips function bodies → replaces with RPC call stubs
3. **Server build** keeps function bodies → appends registration calls
4. At runtime, client stubs call the server endpoint, which dispatches to registered handlers

---

## Development

| Command | What it does |
|---------|--------------|
| `npm run build` | Build all packages (Turborepo, cached) |
| `npm run dev` | Watch mode across all packages |
| `npm run test` | Unit tests (Vitest) |
| `npm run test:e2e` | E2E tests (Playwright, Chromium) |
| `npm run lint` | Lint + format check (Biome) |
| `npm run format` | Auto-format (Biome) |
| `npm run check-types` | TypeScript type-check |

To iterate on a single package, rebuild once from root, then use `npm run dev` inside that package directory.

Examples under `examples/` double as `ev init` templates and as manual testing targets — run `npm run dev` inside any example to try your changes.

---

## Code Style

We use **Biome** (not ESLint/Prettier). Key rules:

- 2-space indent, double quotes, semicolons always, trailing commas
- `import type` / `export type` required for type-only imports
- `===` required (no `==`)
- No `export * from` re-exports
- Auto-organized imports

Run `npx biome check --write .` to fix everything at once.

---

## Testing

- **Unit tests** (Vitest) — per-package, co-located with source or in `tests/`
- **E2E tests** (Playwright) — in `e2e/cases/`, test real example apps in a browser

---

## Git Hooks

Husky runs **before every push**:
- `npm run lint`
- `npm run check-types`

Fix any issues before pushing.

---

## Pull Requests

1. Branch from `main` using a prefix: `feat/`, `fix/`, `docs/`, `refactor/`, `test/`, `chore/`
2. Make focused, atomic commits
3. Verify: `npm run build && npm run test && npm run lint && npm run check-types`
4. Open a PR with a clear description of what changed and why

---

## Things to Avoid

- Don't install webpack manually — it's bundled in `@evjs/cli`
- Don't create `webpack.config.cjs` — use `ev.config.ts` or zero-config
- Don't use CommonJS (`require`) — everything is ESM
- Don't use default exports for server functions — use named async functions
- Import `defineConfig` from `@evjs/cli`, not `@evjs/runtime`

---

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
