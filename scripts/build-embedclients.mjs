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

const distRootDir = path.join(projectRoot, "dist", "embedclients");
const distBundleName = "embedclients";
const distBundleDir = path.join(distRootDir, distBundleName);
const distZipFile = path.join(distRootDir, `${distBundleName}.zip`);

/**
 * Runs embedclients build.
 * @returns {Promise<void>} Resolves when build is complete.
 */
async function main() {
  await validateSourcePaths();
  await buildBundle();

  const zipStats = await fs.stat(distZipFile);
  console.log(`[build:embedclients] Done: ${distZipFile}`);
  console.log(`[build:embedclients] Size: ${formatBytes(zipStats.size)}`);
}

/**
 * Validates required source paths.
 * @returns {Promise<void>} Resolves when all source paths exist.
 */
async function validateSourcePaths() {
  const required = [
    [path.join(projectRoot, "embedclients"), "embedclients source"],
    [path.join(projectRoot, "democlient", "nostr.js"), "democlient nostr.js"],
    [path.join(projectRoot, "vendor", "ndk-3.0.0.js"), "vendor ndk"],
    [path.join(projectRoot, "signer.html"), "signer html"]
  ];

  for (const [targetPath, label] of required) {
    await assertPathExists(targetPath, label);
  }
}

/**
 * Builds embedclients bundle.
 * @returns {Promise<void>} Resolves when bundle is complete.
 */
async function buildBundle() {
  await ensureCleanDirectory(distRootDir);

  await copyDirectoryRecursive(path.join(projectRoot, "embedclients"), path.join(distBundleDir, "embedclients"));
  await copyFileWithParentDirs(path.join(projectRoot, "democlient", "nostr.js"), path.join(distBundleDir, "democlient", "nostr.js"));
  await copyFileWithParentDirs(path.join(projectRoot, "vendor", "ndk-3.0.0.js"), path.join(distBundleDir, "vendor", "ndk-3.0.0.js"));
  await copyFileWithParentDirs(path.join(projectRoot, "signer.html"), path.join(distBundleDir, "signer.html"));

  await createZipArchive(distBundleDir, distBundleName, distZipFile);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[build:embedclients] Failed: ${message}`);
  process.exitCode = 1;
});