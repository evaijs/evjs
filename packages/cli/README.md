# @evjs/cli

Simplified CLI for the **ev** framework.

## Installation

```bash
npm install -g @evjs/cli
```

## Commands

### `ev init [name]`
Scaffold a new project. You can choose between:
- `basic-csr`: Client-side rendered SPA.
- `basic-server-fns`: Project with React Server Functions enabled.

### `ev dev`
Starts the development server.

### `ev build`
Compiles the project for production.

## Configuration

The CLI automatically detects your `webpack.config.cjs` and handles the build orchestration.
