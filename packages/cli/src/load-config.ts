import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { EvConfig } from "./config.js";

const CONFIG_FILES = ["ev.config.ts", "ev.config.js", "ev.config.mjs"];
const TS_CONFIG_EXTENSIONS = new Set([".ts", ".mts", ".cts"]);

type LoadConfigDependencies = {
  ensureTsLoader?: () => Promise<void>;
  importModule?: (configPath: string) => Promise<unknown>;
};

/**
 * Ensure a TypeScript loader is registered before importing `.ts` config files.
 * Tries `@swc-node/register/esm-register` (ships alongside `@swc/core` which
 * the CLI already bundles), then falls back to Node's built-in `--loader tsx`
 * pathway. If neither is available the raw `import()` is attempted anyway —
 * Node will throw a clear error telling the user to install a loader.
 */
async function ensureTsLoader(): Promise<void> {
  try {
    // @ts-expect-error — optional dependency, may not be installed
    await import("@swc-node/register/esm-register");
  } catch {
    // Loader not available — Node may still handle .ts via --loader flag
  }
}

async function importConfigModule(configPath: string): Promise<unknown> {
  return import(pathToFileURL(configPath).href);
}

function shouldUseTsLoader(configPath: string): boolean {
  return TS_CONFIG_EXTENSIONS.has(path.extname(configPath));
}

function resolveConfigPath(
  cwd: string,
  configPath?: string,
): string | undefined {
  if (configPath) {
    return path.resolve(cwd, configPath);
  }

  for (const filename of CONFIG_FILES) {
    const resolvedPath = path.resolve(cwd, filename);
    if (fs.existsSync(resolvedPath)) {
      return resolvedPath;
    }
  }

  return undefined;
}

/**
 * Load evjs config from the project root.
 *
 * Looks for `ev.config.ts`, `.js`, or `.mjs` in the given directory, or loads
 * the explicit config path when provided.
 * Returns undefined if no config file is found.
 */
export async function loadConfig(
  cwd: string,
  configPath?: string,
  deps: LoadConfigDependencies = {},
): Promise<EvConfig | undefined> {
  const resolvedConfigPath = resolveConfigPath(cwd, configPath);

  if (!resolvedConfigPath) {
    return undefined;
  }

  if (!fs.existsSync(resolvedConfigPath)) {
    throw new Error(`Config file not found: ${resolvedConfigPath}`);
  }

  if (shouldUseTsLoader(resolvedConfigPath)) {
    await (deps.ensureTsLoader ?? ensureTsLoader)();
  }

  const mod = await (deps.importModule ?? importConfigModule)(
    resolvedConfigPath,
  );
  return (mod as { default?: EvConfig }).default ?? (mod as EvConfig);
}
