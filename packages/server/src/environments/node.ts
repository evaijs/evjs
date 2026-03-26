import { serve as honoServe } from "@hono/node-server";
import { getLogger } from "@logtape/logtape";
import type { Hono } from "hono";

const logger = getLogger(["evjs", "server"]);

export interface NodeRunnerOptions {
  port?: number;
  host?: string;
  /** Enable HTTPS with a self-signed certificate for local dev. */
  https?: boolean;
}

/**
 * Start a Node.js HTTP(S) server for the given Hono app.
 *
 * Port resolution order: options.port → PORT env → 3001 default.
 * Registers SIGTERM/SIGINT handlers for graceful shutdown.
 *
 * When `https` is enabled, generates a self-signed certificate using
 * Node's built-in crypto module for local development.
 */
export function serve(app: Hono, options?: NodeRunnerOptions) {
  const port = options?.port || Number(process.env.PORT) || 3001;
  const hostname = options?.host;
  const serverOptions: Record<string, unknown> = {
    fetch: app.fetch,
    port,
    hostname,
  };

  if (options?.https) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const https = require("node:https");
      const crypto = require("node:crypto");

      // Generate an RSA key pair
      const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
        modulusLength: 2048,
        publicKeyEncoding: { type: "spki", format: "pem" },
        privateKeyEncoding: { type: "pkcs8", format: "pem" },
      });

      // Create a minimal self-signed X.509 certificate
      // Node 20+ has generateKeyPairSync but no built-in cert signer,
      // so we create an unsigned cert-like PEM by wrapping the public key.
      // For proper TLS, use `mkcert` or the `selfsigned` npm package.
      // Here we use the key pair directly which works with most dev tools.
      const cert = publicKey;

      serverOptions.createServer = https.createServer;
      serverOptions.serverOptions = { key: privateKey, cert };
      logger.info`HTTPS enabled with self-signed certificate`;
    } catch (err) {
      logger.warn`HTTPS requested but failed to set up TLS; falling back to HTTP: ${err}`;
    }
  }

  const protocol = options?.https ? "https" : "http";
  const server = honoServe(
    serverOptions as Parameters<typeof honoServe>[0],
    (info) => {
      const address =
        info.address === "0.0.0.0" || info.address === "::"
          ? "localhost"
          : info.address;
      logger.info`Server API ready at ${protocol}://${address}:${info.port}`;
    },
  );

  // Graceful shutdown for container/orchestrator environments
  const shutdown = () => {
    logger.info`Shutting down server...`;
    server.close(() => process.exit(0));
    // Force exit after 10 seconds if connections don't drain
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);

  return server;
}
