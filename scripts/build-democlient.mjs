import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertPathExists,
  copyDirectoryRecursive,
  copyFileWithParentDirs,
  createZipArchive,
  ensureCleanDirectory,
  formatBytes
} from "./build-utils.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const distRootDir = path.join(projectRoot, "dist", "democlient");
const distBundleName = "democlient";
const distBundleDir = path.join(distRootDir, distBundleName);
const distZipFile = path.join(distRootDir, `${distBundleName}.zip`);

/**
 * Runs democlient build.
 * @returns {Promise<void>} Resolves when build is complete.
 */
async function main() {
  await validateSourcePaths();
  await buildBundle();

  const zipStats = await fs.stat(distZipFile);
  console.log(`[build:democlient] Done: ${distZipFile}`);
  console.log(`[build:democlient] Size: ${formatBytes(zipStats.size)}`);
}

/**
 * Validates required source paths.
 * @returns {Promise<void>} Resolves when all source paths exist.
 */
async function validateSourcePaths() {
  const required = [
    [path.join(projectRoot, "democlient"), "democlient source"],
    [path.join(projectRoot, "nostrclient", "shared", "nostr.js"), "nostr bridge module"],
    [path.join(projectRoot, "vendor", "ndk-3.0.0.js"), "vendor ndk"]
  ];

  for (const [targetPath, label] of required) {
    await assertPathExists(targetPath, label);
  }
}

/**
 * Builds democlient standalone bundle.
 * This bundle intentionally excludes signer assets.
 * @returns {Promise<void>} Resolves when bundle is built.
 */
async function buildBundle() {
  await ensureCleanDirectory(distRootDir);
  await copyDirectoryRecursive(path.join(projectRoot, "democlient"), distBundleDir);
  await copyFileWithParentDirs(
    path.join(projectRoot, "nostrclient", "shared", "nostr.js"),
    path.join(distRootDir, "nostrclient", "shared", "nostr.js")
  );
  await copyFileWithParentDirs(
    path.join(projectRoot, "vendor", "ndk-3.0.0.js"),
    path.join(distRootDir, "vendor", "ndk-3.0.0.js")
  );
  await createZipArchive(distRootDir, distBundleName, distZipFile);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[build:democlient] Failed: ${message}`);
  process.exitCode = 1;
});
