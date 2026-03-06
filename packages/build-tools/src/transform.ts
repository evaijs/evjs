import { createHash } from "node:crypto";
import path from "node:path";
import { parse } from "@swc/core";
import type { TransformOptions } from "./types.js";
import { detectUseServer, makeFnId } from "./utils.js";

/**
 * Transform a "use server" file for either client or server builds.
 * This is a pure function with no bundler dependency.
 *
 * - **Server**: keeps original source + appends `registerServerFn()` calls
 * - **Client**: replaces function bodies with `__ev_call()` transport stubs
 *
 * @param source - The original file source code
 * @param options - Transform context (paths, server/client, manifest callback)
 * @returns The transformed source code, or the original if not a "use server" file
 */
export async function transformServerFile(
  source: string,
  options: TransformOptions,
): Promise<string> {
  if (!detectUseServer(source)) {
    return source;
  }

  const program = await parse(source, {
    syntax: "typescript",
    tsx: true,
    comments: false,
    script: false,
  });

  const exportNames: string[] = [];

  for (const item of program.body) {
    if (item.type === "ExportDeclaration") {
      const decl = item.declaration;
      if (decl.type === "FunctionDeclaration") {
        if (decl.identifier.value) exportNames.push(decl.identifier.value);
      } else if (decl.type === "VariableDeclaration") {
        for (const v of decl.declarations) {
          if (v.id.type === "Identifier") {
            exportNames.push(v.id.value);
          }
        }
      }
    } else if (item.type === "ExportNamedDeclaration") {
      for (const specifier of item.specifiers) {
        if (specifier.type === "ExportSpecifier") {
          if (specifier.exported?.type === "Identifier") {
            exportNames.push(specifier.exported.value);
          } else if (specifier.orig.type === "Identifier") {
            exportNames.push(specifier.orig.value);
          }
        }
      }
    }
  }

  if (exportNames.length === 0) {
    return source;
  }

  if (options.isServer) {
    // Server build: keep original + register
    const registrations = exportNames
      .map((name) => {
        const fnId = makeFnId(options.rootContext, options.resourcePath, name);
        if (options.onServerFn) {
          const relativePath = path.relative(
            options.rootContext,
            options.resourcePath,
          );
          const moduleId = createHash("sha256")
            .update(relativePath)
            .digest("hex")
            .slice(0, 16);
          options.onServerFn(fnId, { moduleId, export: name });
        }
        return `registerServerFn("${fnId}", ${name});`;
      })
      .join("\n");

    return `import { registerServerFn } from "@evjs/runtime/server";\n${source}\n${registrations}\n`;
  }

  // Client build: replace with transport stubs
  const stubCode = exportNames
    .map((name) => {
      const fnId = makeFnId(options.rootContext, options.resourcePath, name);
      return `export function ${name}(...args) {\n  return __ev_call("${fnId}", args);\n}\n${name}.evId = "${fnId}";`;
    })
    .join("\n\n");

  return `import { __ev_call } from "@evjs/runtime/client/transport";\n\n${stubCode}\n`;
}
