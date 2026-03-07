import { createRequire } from "node:module";
import path from "node:path";
import type { EvfConfig } from "./config.js";

const esmRequire = createRequire(import.meta.url);

/**
 * Default values for evf configuration.
 */
const DEFAULTS = {
  entry: "./src/main.tsx",
  html: "./index.html",
  port: 3000,
  serverPort: 3001,
} as const;

/**
 * Create a webpack configuration object from EvfConfig.
 *
 * This replaces the 70+ line webpack.config.cjs boilerplate that
 * every project had to maintain manually. Returns a plain object
 * that can be passed directly to the webpack Node API.
 */
export function createWebpackConfig(
  config: EvfConfig | undefined,
  cwd: string,
): Record<string, unknown> {
  const client = config?.client;
  const server = config?.server;
  const entry = client?.entry ?? DEFAULTS.entry;
  const html = client?.html ?? DEFAULTS.html;
  const port = client?.dev?.port ?? DEFAULTS.port;
  const serverPort = server?.dev?.port ?? DEFAULTS.serverPort;
  const isProduction = process.env.NODE_ENV === "production";

  const HtmlWebpackPlugin = esmRequire("html-webpack-plugin");
  const { EvWebpackPlugin } = esmRequire("@evjs/webpack-plugin");

  const pluginOptions =
    server?.middleware?.length
      ? { server: { middleware: server.middleware } }
      : undefined;

  // Resolve loader paths from evf's dependency tree so they work
  // even when the user's project doesn't list them as direct deps.
  const resolveLoader = (id: string): string => {
    try {
      return esmRequire.resolve(id);
    } catch {
      return id;
    }
  };

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
              loader: resolveLoader(
                "@evjs/webpack-plugin/server-fn-loader",
              ),
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
      port,
      hot: true,
      devMiddleware: { writeToDisk: true },
      proxy: [
        {
          context: ["/api"],
          target: `http://localhost:${serverPort}`,
        },
      ],
      ...client?.dev,
    },
  };
}
