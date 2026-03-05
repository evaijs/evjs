# @evjs/webpack-plugin

Build-time integration for React Server Functions in the **ev** framework.

## Features

- **`EvWebpackPlugin`**: Zero-config plugin that:
  - Auto-discovers `"use server"` files on server builds (`target: "node"`).
  - Emits a versioned `manifest.json` mapping function IDs to source locations.
- **`server-fn-loader`**: Transforms files marked with `"use server"`.
  - On the **server**: Keeps source code and registers the function.
  - On the **client**: Replaces the implementation with an RPC stub.

## Usage

```js
const { EvWebpackPlugin } = require("@evjs/webpack-plugin");

module.exports = {
  plugins: [
    new EvWebpackPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          { loader: "swc-loader", /* ... */ },
          {
            loader: "@evjs/webpack-plugin/server-fn-loader",
            options: { isServer: false }
          }
        ]
      }
    ]
  }
};
```

On server builds, `EvWebpackPlugin` automatically discovers all `"use server"` files under `./src/` and injects them as Webpack entries — no manual imports needed.
