/**
 * Server-side runtime utilities (environment-agnostic).
 *
 * For environment-specific adapters, use:
 * - @evjs/runtime/server/node
 * - @evjs/runtime/server/ecma
 */

export type { CreateAppOptions } from "./app";
export { createApp } from "./app";
export { createRpcMiddleware, registerServerFn } from "./handler";
