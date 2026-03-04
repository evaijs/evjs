/**
 * Webpack loader that transforms `"use server"` modules.
 *
 * - **Client builds** (`target: "web"`): Strips all server code and replaces
 *   each export with an RPC stub that calls `__evai_rpc(fnId, args)`.
 * - **Server builds** (`target: "node"`): Keeps the original code and appends
 *   calls to `registerServerFn(fnId, fn)` for each export.
 *
 * Usage in webpack.config.cjs:
 *
 * ```js
 * {
 *   test: /\.server\.tsx?$/,
 *   use: {
 *     loader: "@evai/runtime/webpack/server-fn-loader",
 *     options: { isServer: false }
 *   }
 * }
 * ```
 */

interface LoaderContext {
  getOptions(): { isServer?: boolean };
  resourcePath: string;
}

/**
 * Derive a stable function ID from the file path and export name.
 * e.g. `/src/server/user.server.ts` + `getUser` → `user_server__getUser`
 */
function makeFnId(resourcePath: string, exportName: string): string {
  // Extract meaningful path segment (after src/)
  const match = resourcePath.match(/src[/\\](.+)\.[tj]sx?$/);
  const stem = match ? match[1] : resourcePath;
  const normalized = stem.replace(/[/\\]/g, "_").replace(/\./g, "_");
  return `${normalized}__${exportName}`;
}

/**
 * Parse exported function/const names from the source using simple regex.
 * Handles:
 *   export async function foo(...)
 *   export function foo(...)
 *   export const foo = ...
 */
function parseExportNames(source: string): string[] {
  const names: string[] = [];
  const regex = /export\s+(?:async\s+)?(?:function|const|let|var)\s+(\w+)/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(source)) !== null) {
    names.push(m[1]);
  }
  return names;
}

/**
 * Check whether the source starts with the `"use server"` directive.
 */
function hasUseServerDirective(source: string): boolean {
  // Match "use server" or 'use server' at the very start (possibly after whitespace/comments)
  const trimmed = source.replace(/^(\s|\/\/[^\n]*\n|\/\*[\s\S]*?\*\/)*/, "");
  return /^["']use server["'];?\s/.test(trimmed);
}

export default function serverFnLoader(this: LoaderContext, source: string): string {
  if (!hasUseServerDirective(source)) {
    return source;
  }

  const { isServer = false } = this.getOptions();
  const exportNames = parseExportNames(source);

  if (exportNames.length === 0) {
    return source;
  }

  if (isServer) {
    // ── Server build: keep original code + register each export ──
    const registrations = exportNames
      .map((name) => {
        const fnId = makeFnId(this.resourcePath, name);
        return `registerServerFn("${fnId}", ${name});`;
      })
      .join("\n");

    return `import { registerServerFn } from "@evai/runtime/server";\n${source}\n${registrations}\n`;
  }

  // ── Client build: replace everything with RPC stubs ──
  const stubs = exportNames
    .map((name) => {
      const fnId = makeFnId(this.resourcePath, name);
      return `export function ${name}(...args) {\n  return __evai_rpc("${fnId}", args);\n}`;
    })
    .join("\n\n");

  return `import { __evai_rpc } from "@evai/runtime/client";\n\n${stubs}\n`;
}
