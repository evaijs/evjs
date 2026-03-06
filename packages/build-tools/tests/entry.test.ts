import { describe, expect, it } from "vitest";
import { generateServerEntry } from "../src/entry.js";

describe("generateServerEntry", () => {
  it("generates entry with default app factory", () => {
    const result = generateServerEntry(undefined, [
      "/project/src/api/users.server.ts",
    ]);

    expect(result).toContain("import { createApp }");
    expect(result).toContain("@evjs/runtime/server");
    expect(result).toContain("import * as _fns_0");
    expect(result).toContain("const app = createApp()");
    expect(result).toContain("export default app");
  });

  it("always exports default app (environment-agnostic)", () => {
    const result = generateServerEntry(undefined, [
      "/project/src/api/users.server.ts",
    ]);

    expect(result).toContain("export default app");
    expect(result).not.toContain("runNodeServer");
  });

  it("supports custom app factory", () => {
    const result = generateServerEntry(
      { appFactory: "./custom#myCreateApp" },
      ["/project/src/api/users.server.ts"],
    );

    expect(result).toContain('import { myCreateApp } from "./custom"');
    expect(result).toContain("const app = myCreateApp()");
  });

  it("imports all server modules", () => {
    const result = generateServerEntry(undefined, [
      "/project/src/api/users.server.ts",
      "/project/src/api/posts.server.ts",
      "/project/src/api/auth.server.ts",
    ]);

    expect(result).toContain("import * as _fns_0");
    expect(result).toContain("import * as _fns_1");
    expect(result).toContain("import * as _fns_2");
  });

  it("includes setup imports when configured", () => {
    const result = generateServerEntry(
      {
        setup: [
          'import "./instrument.js";',
          'import { config } from "dotenv";',
        ],
      },
      ["/project/src/api/users.server.ts"],
    );

    expect(result).toContain('import "./instrument.js"');
    expect(result).toContain('import { config } from "dotenv"');
  });

  it("handles empty server modules array", () => {
    const result = generateServerEntry(undefined, []);

    expect(result).toContain("const app = createApp()");
    expect(result).not.toContain("import * as _fns");
  });
});
