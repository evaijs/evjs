import { emitCode } from "./codegen.js";
import { getServerEntryTemplate } from "./template.js";
import type { ServerEntryConfig } from "./types.js";

/**
 * Generate the server entry source code from discovered server modules.
 *
 * The generated entry:
 * 1. Imports user's "use server" modules (registering functions as side effects)
 * 2. Re-exports them as named exports (_fns_0, _fns_1, ...)
 * 3. Re-exports `createApp` so the adapter can create a Hono app that
 *    shares the same function registry
 * 4. Exports a default fetch handler using the ECMA runtime adapter for FaaS platforms
 *
 * @param config - Server entry configuration (setup imports)
 * @param serverModulePaths - Absolute paths to discovered "use server" modules
 * @param endpoint - Server function endpoint path
 * @returns The generated server entry source code string
 */
export function generateServerEntry(
  config: ServerEntryConfig | undefined,
  serverModulePaths: string[],
  endpoint?: string,
): string {
  const source = getServerEntryTemplate({
    middlewareImports: config?.middleware ?? [],
    serverModulePaths,
    endpoint,
    runner: config?.runner,
  });

  return emitCode(source);
}
