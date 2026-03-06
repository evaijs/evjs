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

  it("includes runner when configured", () => {
    const result = generateServerEntry(
      { runner: "@evjs/runtime/server#runNodeServer" },
      ["/project/src/api/users.server.ts"],
    );

    // Runner and factory from same module should be combined import
    expect(result).toContain("import { createApp, runNodeServer }");
    expect(result).toContain("runNodeServer(app)");
    expect(result).not.toContain("export default app");
  });

  it("separates imports when runner is from a different module", () => {
    const result = generateServerEntry(
      { runner: "./custom-runner#startServer" },
      ["/project/src/api/users.server.ts"],
    );

    expect(result).toContain(
      'import { createApp } from "@evjs/runtime/server"',
    );
    expect(result).toContain('import { startServer } from "./custom-runner"');
    expect(result).toContain("startServer(app)");
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
