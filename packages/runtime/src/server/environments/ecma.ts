import type { Hono } from "hono";

/**
 * ECMA-standard environment adapter.
 *
 * Exports the Hono app's fetch handler as a standard ECMA-compatible
 * module. Works in any runtime that supports the Fetch API standard
 * (Deno, Bun, Cloudflare Workers, Vercel Edge, etc.).
 *
 * Usage:
 * ```ts
 * import app from "./dist/server/index.js";
 * import { createHandler } from "@evjs/runtime/server/ecma";
 * export default createHandler(app);
 * ```
 */
export function createHandler(app: Hono) {
  return {
    fetch: app.fetch,
  };
}
