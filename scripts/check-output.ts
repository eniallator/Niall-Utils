#!/usr/bin/env node
import { rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as tar from "tar";

import { raise } from "../src/core/utils.ts";
import { run } from "./lib/proc.ts";

interface PackedFile {
  filename: string;
}

interface PackedPackageJson {
  files?: unknown;
  main?: unknown;
  types?: unknown;
}

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));

const tryPack = () => {
  for (const [command, args] of [
    ["pnpm", ["pack", "--json"]],
    ["npm", ["pack", "--json"]],
    ["corepack", ["npm", "pack", "--json"]],
  ] as const) {
    try {
      return run(command, args, { cwd: repoRoot });
    } catch {
      continue;
    }
  }
  throw new Error("Failed to run npm pack.");
};

console.log("Packing package for inspection..");

const packed = JSON.parse(tryPack()) as PackedFile | PackedFile[];
const tarballFile =
  [packed].flat()[0]?.filename ?? raise(new Error("npm pack output is empty."));
const tarball = resolve(repoRoot, tarballFile);

console.log(`Created tarball: ${tarballFile}`);

const paths = new Set<string>();
const pkgJsonChunks: Buffer[] = [];

await tar.list({
  file: tarball,
  onReadEntry: entry => {
    paths.add(entry.path);
    if (entry.path === "package/package.json") {
      entry.on("data", (chunk: Buffer) => pkgJsonChunks.push(chunk));
    }
  },
});

for (const expected of [
  "package/dist/index.js",
  "package/dist/index.d.ts",
  "package/package.json",
]) {
  if (!paths.has(expected)) {
    throw new Error(`Missing expected file: ${expected}`);
  }
}

const pkg = JSON.parse(
  Buffer.concat(pkgJsonChunks).toString("utf8")
) as PackedPackageJson;

if (
  !Array.isArray(pkg.files) ||
  !pkg.files.includes("dist") ||
  pkg.main !== "dist/index.js" ||
  pkg.types !== "dist/index.d.ts"
) {
  throw new Error("package.json contains invalid package entry fields.");
}

console.log("Package output inspection passed.");

rmSync(tarball, { force: true });
