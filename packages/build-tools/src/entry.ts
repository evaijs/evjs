import { emitCode } from "./codegen.js";
import type { ServerEntryConfig } from "./types.js";
import { parseModuleRef } from "./utils.js";

/**
 * Generate the server entry source code from discovered server modules
 * and configuration. The generated entry is environment-agnostic —
 * it always exports a Hono app as the default export.
 *
 * @param config - Server entry configuration (app factory, setup)
 * @param serverModulePaths - Absolute paths to discovered "use server" modules
 * @returns The generated server entry source code string
 */
export function generateServerEntry(
  config: ServerEntryConfig | undefined,
  serverModulePaths: string[],
): string {
  const appFactoryRef = config?.appFactory ?? "@evjs/runtime/server#createApp";
  const appFactory = parseModuleRef(appFactoryRef);

  const appImport = `import { ${appFactory.exportName} } from ${JSON.stringify(appFactory.module)};`;

  const moduleImports = serverModulePaths
    .map((p, i) => `import * as _fns_${i} from ${JSON.stringify(p)};`)
    .join("\n");

  return emitCode(
    [
      appImport,
      ...(config?.setup ?? []),
      moduleImports,
      `const app = ${appFactory.exportName}();`,
      "export default app;",
    ]
      .filter(Boolean)
      .join("\n"),
  );
}

