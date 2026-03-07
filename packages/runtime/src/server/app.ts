/**
 * Server application factory.
 *
 * Creates a Hono app with server function handler.
 * This app is runtime-agnostic and can be mounted in Node, Edge, or Bun.
 */

import { Hono } from "hono";
import type { Codec } from "../codec";
import { DEFAULT_ENDPOINT } from "../constants";
import { createHandler } from "./handler";

/** Options for createApp. */
export interface CreateAppOptions {
  /** server function endpoint path. Defaults to "/api/fn". */
  endpoint?: string;
  /** Custom codec for the server function endpoint. Defaults to JSON. */
  codec?: Codec;
  /** Health check endpoint path, or `false` to disable. Defaults to "/health". */
  healthCheck?: string | false;
}

/**
 * Create an ev API server application.
 *
 * Mounts the server function handler at `/api/fn`.
 * In Stage 3, this will be extended with SSR middleware.
 *
 * @param options - Application configuration.
 * @returns A runtime-agnostic Hono app instance.
 */
export function createApp(options?: CreateAppOptions): Hono {
  const {
    endpoint = DEFAULT_ENDPOINT,
    codec,
    healthCheck = "/health",
  } = options ?? {};

  const app = new Hono();

  // Health check for load balancers / container orchestrators
  if (healthCheck !== false) {
    app.get(healthCheck, (c) => c.json({ status: "ok" }));
  }

  // Mount server function endpoint
  app.route(endpoint, createHandler({ codec }));

  return app;
}
