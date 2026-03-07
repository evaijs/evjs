/**
 * Server configuration.
 *
 * Controls server function endpoint, runner, middleware, codec, and port.
 */
export interface ServerConfig {
  /** Server runner module. Default: "@evjs/runtime/server/node". */
  runner?: string;
  /** Server function endpoint path. Default: "/api/fn". */
  endpoint?: string;
  /** Middleware module paths to auto-register in server entry. */
  middleware?: string[];
  /** Dev server options. */
  dev?: {
    /** API server port (dev mode). Default: 3001. */
    port?: number;
    [key: string]: unknown;
  };
}

/**
 * Client configuration.
 *
 * Controls entry point, HTML template, dev server, and transport.
 */
export interface ClientConfig {
  /** Client entry point. Default: "./src/main.tsx". */
  entry?: string;
  /** HTML template path. Default: "./index.html". */
  html?: string;
  // TODO: MPA support — add `pages` field as Record<string, { entry, html? }>
  // When `pages` is set it takes precedence over `entry`/`html` and generates
  // multiple webpack entries + HtmlWebpackPlugin instances.
  /** Dev server options. */
  dev?: {
    /** Dev server port. Default: 3000. */
    port?: number;
    /** Extra webpack-dev-server options (merged with defaults). */
    [key: string]: unknown;
  };
  /** Transport options for server function calls. */
  transport?: {
    /** Base URL for the server function endpoint. */
    baseUrl?: string;
    /** Path prefix for the server function endpoint. */
    endpoint?: string;
  };
}

/**
 * evf framework configuration.
 */
export interface EvfConfig {
  server?: ServerConfig;
  client?: ClientConfig;
}

/**
 * Define configuration for the evf framework.
 *
 * @example
 * ```ts
 * // ev.config.ts
 * import { defineConfig } from "evf";
 *
 * export default defineConfig({
 *   client: {
 *     entry: "./src/main.tsx",
 *     dev: { port: 3000 },
 *   },
 *   server: {
 *     endpoint: "/api/fn",
 *     dev: { port: 3001 },
 *   },
 * });
 * ```
 */
export function defineConfig(config: EvfConfig): EvfConfig {
  return config;
}
