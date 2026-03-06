/**
 * E2E test fixtures for evjs framework.
 *
 * Provides a custom test fixture that:
 * 1. Builds the example app with webpack (NODE_ENV=development to include server runner)
 * 2. Starts the compiled server bundle (which self-starts via runNodeServer)
 * 3. Starts a static file server for the client bundle
 * 4. Tears everything down after tests complete
 */

import { type ChildProcess, execSync, spawn } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { test as base, expect } from "@playwright/test";

export { expect };

interface ExampleFixture {
  /** Base URL where the app is served. */
  baseURL: string;
}

/**
 * Create a test fixture for a specific example directory.
 *
 * Builds with webpack (NODE_ENV=development so the runner is included),
 * starts the server on port 3001, serves the client on port 3000.
 */
export function createExampleTest(exampleName: string) {
  // biome-ignore lint/style/noNonNullAssertion: import.meta.dirname always defined in Node 21+
  const exampleDir = path.resolve(
    import.meta.dirname!,
    "..",
    "examples",
    exampleName,
  );

  return base.extend<ExampleFixture>({
    // biome-ignore lint/correctness/noEmptyPattern: Playwright fixture pattern
    baseURL: async ({}, use) => {
      // 1. Build with NODE_ENV=development (includes server runner)
      execSync("npx webpack --config webpack.config.cjs", {
        cwd: exampleDir,
        stdio: "pipe",
        env: {
          ...process.env,
          NODE_ENV: "development",
        },
      });

      // 2. Start the server bundle (self-starting via runNodeServer on port 3001)
      const serverBundlePath = path.join(
        exampleDir,
        "dist",
        "server",
        "index.js",
      );
      let serverProcess: ChildProcess | null = null;

      if (fs.existsSync(serverBundlePath)) {
        serverProcess = spawn("node", [serverBundlePath], {
          cwd: exampleDir,
          stdio: "pipe",
          env: {
            ...process.env,
            NODE_ENV: "development",
          },
        });

        // Wait for server to be ready by polling port 3001
        const start = Date.now();
        const timeout = 15_000;
        let ready = false;

        while (Date.now() - start < timeout) {
          try {
            await new Promise<void>((resolve, reject) => {
              const req = http.get("http://localhost:3001/api/rpc", (res) => {
                res.resume();
                resolve();
              });
              req.on("error", reject);
              req.setTimeout(500, () => {
                req.destroy();
                reject(new Error("timeout"));
              });
            });
            ready = true;
            break;
          } catch {
            await new Promise((r) => setTimeout(r, 300));
          }
        }

        if (!ready) {
          serverProcess.kill();
          throw new Error(
            `Server did not start on port 3001 within ${timeout}ms`,
          );
        }
      }

      // 3. Serve the client bundle on port 3000
      const distDir = path.join(exampleDir, "dist", "client");
      const indexHtml = fs.readFileSync(
        path.join(distDir, "index.html"),
        "utf-8",
      );

      const staticServer = http.createServer((req, res) => {
        const url = req.url || "/";

        // Proxy /api requests to the API server
        if (url.startsWith("/api/")) {
          const proxyReq = http.request(
            `http://localhost:3001${url}`,
            { method: req.method, headers: req.headers },
            (proxyRes) => {
              res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
              proxyRes.pipe(res);
            },
          );
          proxyReq.on("error", () => {
            res.writeHead(502);
            res.end("Bad Gateway");
          });
          req.pipe(proxyReq);
          return;
        }

        // Serve static files
        if (url === "/" || url === "/index.html") {
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(indexHtml);
          return;
        }

        const filePath = path.join(distDir, url);
        if (fs.existsSync(filePath)) {
          const ext = path.extname(filePath);
          const contentType =
            ext === ".js"
              ? "application/javascript"
              : ext === ".css"
                ? "text/css"
                : ext === ".map"
                  ? "application/json"
                  : "text/plain";
          res.writeHead(200, { "Content-Type": contentType });
          fs.createReadStream(filePath).pipe(res);
        } else {
          // SPA fallback
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(indexHtml);
        }
      });

      await new Promise<void>((resolve) => {
        staticServer.listen(3000, resolve);
      });

      await use("http://localhost:3000");

      // Cleanup
      staticServer.close();
      if (serverProcess) {
        serverProcess.kill();
      }
    },
  });
}
