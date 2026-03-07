/**
 * Server-side runtime utilities (environment-agnostic).
 *
 * For environment-specific adapters, use:
 * - @evjs/runtime/server/node
 * - @evjs/runtime/server/ecma
 *
 * For minimal function registration (no Hono), use:
 * - @evjs/runtime/server/register
 */

export type { Codec } from "../codec";
export { jsonCodec } from "../codec";
export { ServerError } from "../errors";
export type { CreateAppOptions } from "./app";
export { createApp } from "./app";
export type {
  DispatchError,
  DispatchResult,
  DispatchSuccess,
  Middleware,
  MiddlewareContext,
} from "./dispatch";
export { dispatch, registerMiddleware } from "./dispatch";
export type { HandlerOptions } from "./handler";
export { createHandler } from "./handler";
export type { ServerFn } from "./register";
export { registerServerFn } from "./register";
