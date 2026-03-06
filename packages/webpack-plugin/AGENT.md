# @evjs/webpack-plugin

Webpack adapter for the ev framework. Thin wrapper over `@evjs/build-tools`.

## EvWebpackPlugin

Auto-discovers `"use server"` files, generates a server entry, spawns a Node-targeted child compiler, and emits `manifest.json`.

```js
const { EvWebpackPlugin } = require("@evjs/webpack-plugin");

new EvWebpackPlugin({
  server: {
    appFactory: "@evjs/runtime/server#createApp",       // default
    runner: process.env.NODE_ENV === "development"
      ? "@evjs/runtime/server#runNodeServer" : undefined,
    setup: [],                                           // extra imports
  },
});
```

### Options
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `server.appFactory` | `string` | `"@evjs/runtime/server#createApp"` | App factory module ref |
| `server.runner` | `string?` | `undefined` | Runner for self-starting server bundles |
| `server.setup` | `string[]` | `[]` | Extra imports prepended to server entry |

## server-fn-loader

Webpack loader for `"use server"` files. Auto-detects client vs server compiler context.

```js
{ loader: "@evjs/webpack-plugin/server-fn-loader" }
```

Client compiler → replaces function bodies with RPC stubs.
Server compiler → keeps bodies, appends registrations, reports to manifest.
