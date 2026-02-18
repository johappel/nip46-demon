import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertPathExists,
  copyDirectoryRecursive,
  copyFileWithParentDirs,
  createBuildToken,
  createZipArchive,
  ensureCleanDirectory,
  formatBytes
} from "./build-utils.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const distRootDir = path.join(projectRoot, "dist", "signer");
const distBundleName = "signer-standalone";
const distBundleDir = path.join(distRootDir, distBundleName);
const distZipFile = path.join(distRootDir, `${distBundleName}.zip`);

/**
 * Runs standalone signer build.
 * @returns {Promise<void>} Resolves when build is complete.
 */
async function main() {
  const buildToken = createBuildToken();
  await validateSourcePaths();
  await buildBundle(buildToken);

  const zipStats = await fs.stat(distZipFile);
  console.log(`[build:signer] Done: ${distZipFile}`);
  console.log(`[build:signer] Size: ${formatBytes(zipStats.size)}`);
  console.log(`[build:signer] Build token: ${buildToken}`);
}

/**
 * Validates required source paths.
 * @returns {Promise<void>} Resolves when all source paths exist.
 */
async function validateSourcePaths() {
  const required = [
    [path.join(projectRoot, "signer.html"), "signer html"],
    [path.join(projectRoot, "signer-nip46.js"), "signer script"],
    [path.join(projectRoot, "signer-ui.css"), "signer css"],
    [path.join(projectRoot, "signer-ui.js"), "signer ui script"],
    [path.join(projectRoot, "sw.js"), "service worker"],
    [path.join(projectRoot, "manifest.webmanifest"), "manifest"],
    [path.join(projectRoot, "icons"), "icons"],
    [path.join(projectRoot, "vendor", "ndk-3.0.0.js"), "vendor ndk"],
  ];

  for (const [targetPath, label] of required) {
    await assertPathExists(targetPath, label);
  }
}

/**
 * Builds standalone signer bundle.
 * @param {string} buildToken Cache-busting token.
 * @returns {Promise<void>} Resolves when bundle is complete.
 */
async function buildBundle(buildToken) {
  await ensureCleanDirectory(distRootDir);

  await copyFileWithParentDirs(path.join(projectRoot, "signer.html"), path.join(distBundleDir, "signer.html"));
  await copyFileWithParentDirs(path.join(projectRoot, "signer-nip46.js"), path.join(distBundleDir, "signer-nip46.js"));
  await copyFileWithParentDirs(path.join(projectRoot, "signer-ui.css"), path.join(distBundleDir, "signer-ui.css"));
  await copyFileWithParentDirs(path.join(projectRoot, "signer-ui.js"), path.join(distBundleDir, "signer-ui.js"));
  await copyFileWithParentDirs(path.join(projectRoot, "sw.js"), path.join(distBundleDir, "sw.js"));
  await copyFileWithParentDirs(path.join(projectRoot, "manifest.webmanifest"), path.join(distBundleDir, "manifest.webmanifest"));
  await copyDirectoryRecursive(path.join(projectRoot, "icons"), path.join(distBundleDir, "icons"));
  await copyFileWithParentDirs(path.join(projectRoot, "vendor", "ndk-3.0.0.js"), path.join(distBundleDir, "vendor", "ndk-3.0.0.js"));

  await patchSignerHtml(path.join(distBundleDir, "signer.html"), buildToken);
  await createZipArchive(distBundleDir, distBundleName, distZipFile);
}

/**
 * Patches signer HTML with cache-busted module URI.
 * @param {string} htmlFilePath HTML file path.
 * @param {string} buildToken Cache-busting token.
 * @returns {Promise<void>} Resolves when patching is complete.
 */
async function patchSignerHtml(htmlFilePath, buildToken) {
  let html = await fs.readFile(htmlFilePath, "utf8");
  html = html.replace(
    /<script\s+type="module"\s+src="\.\/signer-nip46\.js(?:\?v=[^"]+)?"/,
    `<script type="module" src="./signer-nip46.js?v=${buildToken}"`
  );
  await fs.writeFile(htmlFilePath, html, "utf8");
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[build:signer] Failed: ${message}`);
  process.exitCode = 1;
});