import { RUNTIME } from "./types.js";

interface ServerEntryTemplateOptions {
  middlewareImports: string[];
  serverModulePaths: string[];
  endpoint?: string;
  /** Runtime adapter module that exports `createFetchHandler`. */
  runner?: string;
}

export function getServerEntryTemplate({
  middlewareImports,
  serverModulePaths,
  endpoint,
  runner,
}: ServerEntryTemplateOptions): string {
  const runnerModule = runner ?? RUNTIME.ecmaModule;

  const moduleImports = serverModulePaths
    .map((p, i) => `import * as _fns_${i} from ${JSON.stringify(p)};`)
    .join("\n");

  const fnsExports = serverModulePaths.map((_p, i) => `_fns_${i}`);
  const fnsExportStatement = fnsExports.length
    ? `export { ${fnsExports.join(", ")} };`
    : "";

  const endpointArg = endpoint
    ? `{ endpoint: ${JSON.stringify(endpoint)} }`
    : "";

  return [
    `import { createApp } from "${RUNTIME.appModule}";`,
    `import { createFetchHandler } from "${runnerModule}";`,
    ...middlewareImports,
    moduleImports,
    fnsExportStatement,
    `export { createApp };`,
    `const app = createApp(${endpointArg});`,
    `export default createFetchHandler(app);`,
  ]
    .filter(Boolean)
    .join("\n");
}
