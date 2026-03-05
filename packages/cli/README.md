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
Starts the unified development server. Orchestrates Webpack Dev Server for the client and a watched Node.js process for the API server. Handles dynamic discovery of new server functions without restarting.

### `ev build`
Compiles the project for production, generating both client assets (`dist/client`) and a standalone server bundle (`dist/server/index.js`).

## Configuration

The CLI automatically detects your `webpack.config.cjs`. Using the `@evjs/webpack-plugin`, it manages a child compiler to bring zero-config server functions to your project. Templates are symlinked to the monorepo examples for 1:1 parity.
