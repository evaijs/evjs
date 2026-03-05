# @evjs/webpack-plugin

Build-time integration for React Server Functions in the **ev** framework.

## Features

- **`EvWebpackPlugin`**: High-level plugin that coordinates manifest generation and build stages.
- **`server-fn-loader`**: Transformations for files marked with `"use server"`.
  - On the **server**: Keeps source code and registers the function.
  - On the **client**: Replaces the implementation with an RPC stub using `@evjs/runtime`.

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
        test: /\.server\.tsx?$/,
        use: [
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
