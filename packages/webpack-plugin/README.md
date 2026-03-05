# @evjs/webpack-plugin

Build-time integration for React Server Functions in the **ev** framework.

## Features

- **`EvWebpackPlugin`**: Zero-config plugin that:
  - Spawns a Node-targeted **Child Compiler** for server-side code.
  - **Auto-discovers** `"use server"` files in `src/` dynamically.
  - Watches for new files during development and triggers server rebuilds.
  - Emits a versioned `manifest.json` mapping function IDs.
- **`server-fn-loader`**: Transforms files marked with `"use server"`.
  - Automatically detects if it is running in a client or server compiler context.

## Usage

```js
const { EvWebpackPlugin } = require("@evjs/webpack-plugin");

module.exports = {
  plugins: [
    new EvWebpackPlugin() // Handles both client and server discovery
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          { loader: "swc-loader" },
          { loader: "@evjs/webpack-plugin/server-fn-loader" }
        ]
      }
    ]
  }
};
```

`EvWebpackPlugin` handles the heavy lifting of entry generation and child-compiler orchestration, allowing you to focus on writing your application logic.
