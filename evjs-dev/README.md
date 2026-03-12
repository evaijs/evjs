# @antskill/evjs-dev

AI agent skill for developing applications with the [evjs](https://github.com/evaijs/evjs) meta-framework.

## What it does

Gives AI coding agents (Claude Code, CodeFuse, etc.) comprehensive knowledge of the evjs framework:

- **Server Functions** — `"use server"` directive, `.server.ts` files, auto-discovery
- **Client APIs** — `query()`, `mutation()`, TanStack Router + Query patterns
- **Configuration** — `ev.config.ts`, `defineConfig`, zero-config defaults
- **Architecture** — SWC transforms, webpack plugin, Hono server, manifest schema
- **Build System** — `ev dev`, `ev build`, proxy setup, deployment adapters
- **Best Practices** — ESM-only, Biome linting, naming conventions

## Install

```bash
tnpm i -g @antskill/evjs-dev
```

The skill is automatically installed to `~/.claude/skills/evjs-dev/`.

## Uninstall

```bash
tnpm uninstall -g @antskill/evjs-dev
```

## License

MIT
