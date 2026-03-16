import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { loadConfig } from "../src/load-config.js";

const tempDirs: string[] = [];

async function createTempDir(): Promise<string> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "evjs-cli-load-config-"));
  tempDirs.push(dir);
  return dir;
}

afterEach(async () => {
  await Promise.all(
    tempDirs
      .splice(0)
      .map((dir) => fs.rm(dir, { recursive: true, force: true })),
  );
});

describe("loadConfig", () => {
  it("loads the default config file from cwd when present", async () => {
    const cwd = await createTempDir();
    const configPath = path.join(cwd, "ev.config.mjs");

    await fs.writeFile(
      configPath,
      'export default { server: { endpoint: "/from-default" } };\n',
    );

    const config = await loadConfig(cwd);

    expect(config).toEqual({
      server: { endpoint: "/from-default" },
    });
  });

  it("loads an explicit relative config path from cwd", async () => {
    const cwd = await createTempDir();
    const configDir = path.join(cwd, "configs");
    const configPath = path.join(configDir, "custom.mjs");

    await fs.mkdir(configDir, { recursive: true });
    await fs.writeFile(
      configPath,
      'export default { client: { entry: "./src/app.tsx" } };\n',
    );

    const config = await loadConfig(cwd, "./configs/custom.mjs");

    expect(config).toEqual({
      client: { entry: "./src/app.tsx" },
    });
  });

  it("loads an explicit absolute config path", async () => {
    const cwd = await createTempDir();
    const configPath = path.join(cwd, "absolute-config.mjs");

    await fs.writeFile(
      configPath,
      "export default { server: { dev: { port: 4100 } } };\n",
    );

    const config = await loadConfig(cwd, configPath);

    expect(config).toEqual({
      server: { dev: { port: 4100 } },
    });
  });

  it("throws a clear error when the explicit config path does not exist", async () => {
    const cwd = await createTempDir();

    await expect(loadConfig(cwd, "./missing.config.mjs")).rejects.toThrow(
      `Config file not found: ${path.join(cwd, "missing.config.mjs")}`,
    );
  });

  it("prepares the ts loader before importing explicit ts configs", async () => {
    const cwd = await createTempDir();
    const configDir = path.join(cwd, "configs");
    const ensureTsLoader = vi.fn().mockResolvedValue(undefined);
    const importModule = vi.fn().mockResolvedValue({
      default: { server: { endpoint: "/ts-config" } },
    });

    await fs.mkdir(configDir, { recursive: true });
    await fs.writeFile(
      path.join(configDir, "ev.custom.ts"),
      "export default {};\n",
    );

    const config = await loadConfig(cwd, "./configs/ev.custom.ts", {
      ensureTsLoader,
      importModule,
    });

    expect(ensureTsLoader).toHaveBeenCalledTimes(1);
    expect(importModule).toHaveBeenCalledWith(
      path.join(cwd, "configs", "ev.custom.ts"),
    );
    expect(config).toEqual({
      server: { endpoint: "/ts-config" },
    });
  });
});
