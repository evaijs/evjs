import fs from "node:fs";
import type { EvManifest, ServerFnEntry } from "@evjs/manifest";
import type { Compiler } from "webpack";

class ManifestCollector {
  serverFns: Record<string, ServerFnEntry> = {};

  addServerFn(id: string, meta: ServerFnEntry) {
    this.serverFns[id] = meta;
  }

  getManifest(): EvManifest {
    return {
      version: 1,
      serverFns: this.serverFns,
    };
  }
}

type EvCompiler = Compiler & { _ev_manifest_collector?: ManifestCollector };

/** Parse a "module#export" reference string. */
function parseModuleRef(ref: string): { module: string; exportName: string } {
  const idx = ref.indexOf("#");
  if (idx === -1) {
    throw new Error(
      `Invalid module reference "${ref}". Expected format: "module#exportName".`,
    );
  }
  return { module: ref.slice(0, idx), exportName: ref.slice(idx + 1) };
}

/** Configuration for the generated server entry. */
export interface ServerEntryConfig {
  /**
   * Module reference for the app factory.
   * Format: "module#exportName"
   * @default "@evjs/runtime/server#createApp"
   */
  appFactory?: string;

  /**
   * Optional module reference for a runner that auto-starts the server.
   * When set, the bundle is self-starting instead of just exporting the app.
   * Format: "module#exportName"
   * @example "@evjs/runtime/server#runNodeServer"
   */
  runner?: string;

  /**
   * Extra import statements to prepend to the server entry.
   * Useful for middleware, config, or side-effect imports.
   */
  setup?: string[];
}

export interface EvWebpackPluginOptions {
  server?: ServerEntryConfig;
}

/**
 * Webpack plugin for the ev framework.
 *
 * Automatically discovers files with the "use server" directive based on the client dependencies
 * and manages the server-side build via a child compiler.
 */
export class EvWebpackPlugin {
  private options: EvWebpackPluginOptions;

  constructor(options?: EvWebpackPluginOptions) {
    this.options = options ?? {};
  }
  apply(compiler: Compiler) {
    const collector = new ManifestCollector();

    // Attach collector to compiler so the loader can access it
    (compiler as EvCompiler)._ev_manifest_collector = collector;

    // Check if the current compiler is already the Node Child Compiler
    const isServer =
      compiler.options.name === "evServer" ||
      compiler.options.target === "node";

    if (!isServer) {
      // We are in the Client compiler.
      compiler.hooks.make.tapAsync(
        "EvWebpackPlugin",
        async (compilation, callback) => {
          // In Webpack 5, we can use the finishModules hook to inspect all parsed modules
          compilation.hooks.finishModules.tapAsync(
            "EvWebpackPlugin",
            (modules, finishCallback) => {
              let hasServer = false;
              const imports: string[] = [];

              // Resolve app factory
              const appFactoryRef =
                this.options.server?.appFactory ??
                "@evjs/runtime/server#createApp";
              const appFactory = parseModuleRef(appFactoryRef);
              imports.push(
                `import { ${appFactory.exportName} } from ${JSON.stringify(appFactory.module)};`,
              );

              // Resolve optional runner
              let runner: { module: string; exportName: string } | null = null;
              if (this.options.server?.runner) {
                runner = parseModuleRef(this.options.server.runner);
                // Only add a separate import if it's from a different module
                if (runner.module !== appFactory.module) {
                  imports.push(
                    `import { ${runner.exportName} } from ${JSON.stringify(runner.module)};`,
                  );
                } else {
                  // Rewrite the first import to include both exports
                  imports[0] = `import { ${appFactory.exportName}, ${runner.exportName} } from ${JSON.stringify(appFactory.module)};`;
                }
              }

              // Add user-provided setup imports
              if (this.options.server?.setup) {
                for (const stmt of this.options.server.setup) {
                  imports.push(stmt);
                }
              }

              let id = 0;
              for (const module of modules) {
                // Determine if this is a NormalModule with a resource path
                const resource =
                  "resource" in module ? (module.resource as string) : null;
                if (!resource || typeof resource !== "string") continue;

                // Ensure it's a source file (not a node_module or internal webpack file)
                if (
                  resource.includes("node_modules") ||
                  !/\.(ts|tsx|js|jsx)$/.test(resource)
                ) {
                  continue;
                }

                try {
                  const content = fs.readFileSync(resource, "utf-8");
                  const firstLine = content.trimStart().split("\n")[0];
                  const isServerFile = /^["']use server["'];?\s*$/.test(
                    firstLine.trim(),
                  );

                  if (isServerFile) {
                    hasServer = true;
                    imports.push(
                      `import * as _fns_${id++} from ${JSON.stringify(
                        resource,
                      )};`,
                    );
                  }
                } catch (_err) {
                  // Ignore read errors for dynamically generated Webpack modules
                }
              }

              if (!hasServer) {
                return finishCallback();
              }

              // Generate the app creation and export/runner
              imports.push(`const app = ${appFactory.exportName}();`);
              if (runner) {
                imports.push(`${runner.exportName}(app);`);
              } else {
                imports.push(`export default app;`);
              }
              const serverEntryContent = imports.join("\n");

              // Use a Data URI as a virtual entry point
              const serverEntryPath = `data:text/javascript,${encodeURIComponent(
                serverEntryContent,
              )}`;

              // 3. Spawn the Node Server compiler.
              const outputOptions = {
                filename: "../server/index.js",
                library: { type: "commonjs", name: "evServer" },
                chunkFormat: "commonjs",
              };

              const childCompiler = compilation.createChildCompiler(
                "evServer",
                outputOptions,
                [
                  new compiler.webpack.node.NodeTemplatePlugin({
                    asyncChunkLoading: false,
                  }),
                  new compiler.webpack.node.NodeTargetPlugin(),
                  new compiler.webpack.ExternalsPlugin("commonjs", [
                    (
                      { request }: { request?: string },
                      cb: (err?: Error | null, result?: string) => void,
                    ) => {
                      if (
                        request &&
                        typeof request === "string" &&
                        (request.startsWith("node:") ||
                          [
                            "http",
                            "https",
                            "http2",
                            "fs",
                            "path",
                            "crypto",
                            "stream",
                            "os",
                            "assert",
                            "util",
                            "events",
                            "url",
                            "buffer",
                            "zlib",
                            "child_process",
                            "net",
                            "tls",
                            "querystring",
                            "worker_threads",
                          ].includes(request))
                      ) {
                        return cb(null, request);
                      }
                      cb();
                    },
                  ]),
                  new compiler.webpack.EntryPlugin(
                    compiler.context,
                    serverEntryPath,
                    { name: "main" },
                  ),
                ],
              );

              (childCompiler as EvCompiler)._ev_manifest_collector = collector;

              childCompiler.runAsChild((err, _entries, childCompilation) => {
                if (err) return finishCallback(err);
                if (
                  childCompilation?.errors &&
                  childCompilation.errors.length > 0
                ) {
                  return finishCallback(childCompilation.errors[0]);
                }
                finishCallback();
              });
            },
          );
          callback();
        },
      );
    }

    // Emit manifest using modern processAssets hook to avoid deprecation warnings
    compiler.hooks.thisCompilation.tap("EvWebpackPlugin", (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: "EvWebpackPlugin",
          stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
        },
        () => {
          const manifest = collector.getManifest();
          if (Object.keys(manifest.serverFns).length === 0) {
            return;
          }
          const content = JSON.stringify(manifest, null, 2);

          // We place the manifest in the server folder (relative to parent output dist/client)
          compilation.emitAsset(
            "../server/manifest.json",
            new compiler.webpack.sources.RawSource(content),
          );
        },
      );
    });
  }
}
