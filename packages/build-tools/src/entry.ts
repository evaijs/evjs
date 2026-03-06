import type { ServerEntryConfig } from "./types.js";
import { parseModuleRef } from "./utils.js";

/**
 * Generate the server entry source code from discovered server modules
 * and configuration. This is a pure function with no bundler dependency.
 *
 * @param config - Server entry configuration (app factory, runner, setup)
 * @param serverModulePaths - Absolute paths to discovered "use server" modules
 * @returns The generated server entry source code string
 */
export function generateServerEntry(
  config: ServerEntryConfig | undefined,
  serverModulePaths: string[],
): string {
  const imports: string[] = [];

  // Resolve app factory
  const appFactoryRef = config?.appFactory ?? "@evjs/runtime/server#createApp";
  const appFactory = parseModuleRef(appFactoryRef);
  imports.push(
    `import { ${appFactory.exportName} } from ${JSON.stringify(appFactory.module)};`,
  );

  // Resolve optional runner
  let runner: { module: string; exportName: string } | null = null;
  if (config?.runner) {
    runner = parseModuleRef(config.runner);
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
  if (config?.setup) {
    for (const stmt of config.setup) {
      imports.push(stmt);
    }
  }

  // Import discovered server modules
  let id = 0;
  for (const modulePath of serverModulePaths) {
    imports.push(
      `import * as _fns_${id++} from ${JSON.stringify(modulePath)};`,
    );
  }

  // Generate the app creation and export/runner
  imports.push(`const app = ${appFactory.exportName}();`);
  if (runner) {
    imports.push(`${runner.exportName}(app);`);
  } else {
    imports.push(`export default app;`);
  }

  return imports.join("\n");
}
