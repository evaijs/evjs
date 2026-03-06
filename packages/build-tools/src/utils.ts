import { createHash } from "node:crypto";
import path from "node:path";

/** Parse a "module#export" reference string. */
export function parseModuleRef(ref: string): {
  module: string;
  exportName: string;
} {
  const idx = ref.indexOf("#");
  if (idx === -1) {
    throw new Error(
      `Invalid module reference "${ref}". Expected format: "module#exportName".`,
    );
  }
  return { module: ref.slice(0, idx), exportName: ref.slice(idx + 1) };
}

/** Derive a stable function ID from the file path and export name. */
export function makeFnId(
  rootContext: string,
  resourcePath: string,
  exportName: string,
): string {
  const relativePath = path.relative(rootContext, resourcePath);
  return createHash("sha256")
    .update(`${relativePath}:${exportName}`)
    .digest("hex")
    .slice(0, 16);
}

/** Check whether the source starts with the "use server" directive. */
export function detectUseServer(source: string): boolean {
  const trimmed = source.replace(/^(\s|\/\/[^\n]*\n|\/\*[\s\S]*?\*\/)*/, "");
  return /^["']use server["'];?\s/.test(trimmed);
}
