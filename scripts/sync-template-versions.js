import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

// 1. Get current versions from package.json files
function getPackageVersion(pkgPath) {
  const pkg = JSON.parse(fs.readFileSync(path.resolve(rootDir, pkgPath), "utf8"));
  return pkg.version;
}

const cliVersion = getPackageVersion("packages/cli/package.json");
const runtimeVersion = getPackageVersion("packages/runtime/package.json");
const webpackVersion = getPackageVersion("packages/webpack-plugin/package.json");

console.log(`Syncing template versions to:
  cli: ${cliVersion}
  runtime: ${runtimeVersion}
  webpack-plugin: ${webpackVersion}
`);

const templatesDir = path.resolve(rootDir, "packages/cli/templates");
const templates = fs.readdirSync(templatesDir);

for (const template of templates) {
  const pkgPath = path.join(templatesDir, template, "package.json");
  if (!fs.existsSync(pkgPath)) continue;

  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  let modified = false;

  // Update @evjs/ runtime and webpack-plugin
  if (pkg.dependencies?.["@evjs/runtime"]) {
    pkg.dependencies["@evjs/runtime"] = `^${runtimeVersion}`;
    modified = true;
  }
  if (pkg.devDependencies?.["@evjs/webpack-plugin"]) {
    pkg.devDependencies["@evjs/webpack-plugin"] = `^${webpackVersion}`;
    modified = true;
  }
  if (pkg.devDependencies?.["@evjs/cli"]) {
    pkg.devDependencies["@evjs/cli"] = `^${cliVersion}`;
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
    console.log(`Updated ${template}/package.json`);
  }
}
