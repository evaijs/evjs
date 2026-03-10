import { createRequire } from "node:module";
import path from "node:path";
import { CONFIG_DEFAULTS, type EvConfig } from "./config.js";

const esmRequire = createRequire(import.meta.url);

/**
 * Create a webpack configuration object from EvConfig.
 *
 * Returns a plain object that can be passed directly to the webpack Node API.
 *
 * - **fullstack** (default): Client build with React/TanStack, server functions
 *   built via EvWebpackPlugin child compiler.
 * - **serverOnly**: Node-targeted server build with no client bundle. Uses the
 *   same EvWebpackPlugin and loader pipeline, producing isomorphic server output.
 */
export function createWebpackConfig(
  config: EvConfig | undefined,
  cwd: string,
  serverOnlyEntry?: string,
): Record<string, unknown> {
  const client = config?.client;
  const server = config?.server;
  const isProduction = process.env.NODE_ENV === "production";

  const { EvWebpackPlugin } = esmRequire("@evjs/webpack-plugin");

  // Resolve loader paths from evjs's dependency tree so they work
  // even when the user's project doesn't list them as direct deps.
  const resolveLoader = (id: string): string => {
    try {
      return esmRequire.resolve(id);
    } catch {
      return id;
    }
  };

  // Server-only (FaaS) mode
  if (serverOnlyEntry) {
    const pluginOptions = server?.middleware?.length
      ? { server: { middleware: server.middleware } }
      : undefined;

    return {
      name: "server",
      target: "node",
      mode: isProduction ? "production" : "development",
      devtool: isProduction ? "hidden-source-map" : "source-map",
      entry: serverOnlyEntry,
      output: {
        path: path.resolve(cwd, "dist/server"),
        filename: isProduction ? "main.[contenthash:8].js" : "main.js",
        library: { type: "commonjs2" },
        clean: true,
      },
      resolve: {
        extensions: [".tsx", ".ts", ".js"],
      },
      externalsPresets: { node: true },
      module: {
        rules: [
          {
            test: /\.m?js/,
            resolve: { fullySpecified: false },
          },
          {
            test: /\.tsx?$/,
            exclude: /node_modules/,
            use: [
              {
                loader: resolveLoader("swc-loader"),
                options: {
                  jsc: {
                    parser: { syntax: "typescript", tsx: false },
                  },
                },
              },
              {
                loader: resolveLoader("@evjs/webpack-plugin/server-fn-loader"),
                options: { readableIds: true, ignoreDirective: true },
              },
            ],
          },
        ],
      },
      plugins: [new EvWebpackPlugin(pluginOptions)],
    };
  }

  // Fullstack mode (default)
  const entry = client?.entry ?? CONFIG_DEFAULTS.entry;
  const html = client?.html ?? CONFIG_DEFAULTS.html;
  const clientPort = client?.dev?.port ?? CONFIG_DEFAULTS.clientPort;
  const serverPort = server?.dev?.port ?? CONFIG_DEFAULTS.serverPort;
  const endpoint = server?.endpoint ?? CONFIG_DEFAULTS.endpoint;

  const HtmlWebpackPlugin = esmRequire("html-webpack-plugin");

  const pluginOptions = server?.middleware?.length
    ? { server: { middleware: server.middleware } }
    : undefined;

  // Derive the proxy base path from the configured endpoint.
  // e.g. "/api/fn" → "/api", "/rpc/v1" → "/rpc"
  const proxyBase = `/${endpoint.split("/").filter(Boolean)[0] || "api"}`;

  // Destructure port out of dev overrides to avoid passing it twice.
  const { port: _p, ...devServerOverrides } = client?.dev ?? {};

  return {
    name: "client",
    mode: isProduction ? "production" : "development",
    devtool: isProduction ? "hidden-source-map" : "source-map",
    entry,
    output: {
      path: path.resolve(cwd, "dist/client"),
      filename: isProduction ? "[name].[contenthash:8].js" : "index.js",
      clean: true,
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
    },
    module: {
      rules: [
        {
          test: /\.m?js/,
          resolve: { fullySpecified: false },
        },
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: [
            {
              loader: resolveLoader("swc-loader"),
              options: {
                jsc: {
                  parser: { syntax: "typescript", tsx: true },
                  transform: { react: { runtime: "automatic" } },
                },
              },
            },
            {
              loader: resolveLoader("@evjs/webpack-plugin/server-fn-loader"),
            },
          ],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({ template: html }),
      new EvWebpackPlugin(pluginOptions),
    ],
    optimization: isProduction
      ? { splitChunks: { chunks: "all" as const } }
      : undefined,
    devServer: {
      port: clientPort,
      hot: true,
      devMiddleware: { writeToDisk: true },
      proxy: [
        {
          context: [proxyBase],
          target: `http://localhost:${serverPort}`,
        },
      ],
      ...devServerOverrides,
    },
  };
}
