#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { configure, getConsoleSink } from "@logtape/logtape";
import { Command } from "commander";
import fs from "fs-extra";
import { build, dev } from "./index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

await configure({
  sinks: { console: getConsoleSink() },
  loggers: [
    { category: ["logtape", "meta"], lowestLevel: "warning" },
    { category: ["evjs"], sinks: ["console"], lowestLevel: "info" },
  ],
});

const pkg = fs.readJsonSync(path.resolve(__dirname, "../package.json"));
const program = new Command();

program
  .name("ev")
  .description("CLI for the evjs framework")
  .version(pkg.version);

program
  .command("dev")
  .description("Start development server")
  .action(async () => {
    const cwd = process.cwd();
    const { loadConfig } = await import("./load-config.js");
    const config = await loadConfig(cwd);
    try {
      await dev(config ?? undefined, { cwd });
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  });

program
  .command("build")
  .description("Build project for production")
  .action(async () => {
    const cwd = process.cwd();
    const { loadConfig } = await import("./load-config.js");
    const config = await loadConfig(cwd);
    try {
      await build(config ?? undefined, { cwd });
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  });

program.parse();
