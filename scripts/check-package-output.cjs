#!/usr/bin/env node
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

function run(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { encoding: "utf8", stdio: "pipe", ...opts });
}

function runShell(command) {
  return execFileSync(command, {
    encoding: "utf8",
    stdio: "pipe",
    cwd,
    shell: true,
  });
}

function fail(message) {
  console.error(`\nERROR: ${message}`);
  process.exit(1);
}

const cwd = path.resolve(__dirname, "..");

console.log("Packing package for inspection...");
let packOutput;
try {
  packOutput = runShell("npm pack --json");
} catch (error) {
  try {
    packOutput = runShell("yarn npm pack --json");
  } catch (yarnError) {
    try {
      packOutput = runShell("corepack npm pack --json");
    } catch (corepackError) {
      fail(
        `npm pack failed, yarn npm pack failed, and corepack npm pack failed: ${corepackError.message}`
      );
    }
  }
}

let packResult;
try {
  packResult = JSON.parse(packOutput);
} catch (error) {
  fail(`Unable to parse npm pack output as JSON: ${error.message}`);
}

if (!Array.isArray(packResult) || packResult.length === 0) {
  fail("npm pack did not return any package metadata.");
}

const tarball = path.resolve(
  cwd,
  packResult[0].filename ||
    packResult[0].path ||
    packResult[0].name ||
    packResult[0].filename
);
console.log(`Created tarball: ${path.basename(tarball)}`);

let contentList;
try {
  contentList = run("tar", ["-tf", tarball], { cwd });
} catch (error) {
  fail(`Failed to list tarball contents with tar: ${error.message}`);
}

const files = contentList.split(/\r?\n/).filter(Boolean);
const expected = [
  "package/dist/index.js",
  "package/dist/index.d.ts",
  "package/package.json",
];
for (const entry of expected) {
  if (!files.includes(entry)) {
    fail(`Expected package tarball to include ${entry} but it was missing.`);
  }
}

let packageJson;
try {
  const packageJsonRaw = run("tar", ["-xOf", tarball, "package/package.json"], {
    cwd,
  });
  packageJson = JSON.parse(packageJsonRaw);
} catch (error) {
  fail(`Failed to read package.json from the tarball: ${error.message}`);
}

if (!Array.isArray(packageJson.files) || !packageJson.files.includes("dist")) {
  fail('package.json must include "dist" in the files field.');
}

if (packageJson.types !== "dist/index.d.ts") {
  fail('package.json types must be "dist/index.d.ts".');
}

if (packageJson.main !== "dist/index.js") {
  fail('package.json main must be "dist/index.js".');
}

console.log("Package output inspection passed.");

try {
  fs.unlinkSync(tarball);
  console.log(`Removed temporary tarball ${path.basename(tarball)}.`);
} catch {
  // ignore cleanup failures
}
