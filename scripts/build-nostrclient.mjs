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

const distRootDir = path.join(projectRoot, "dist", "nostrclient");
const distBundleName = "nostrclient";
const distBundleDir = path.join(distRootDir, distBundleName);
const distZipFile = path.join(distRootDir, `${distBundleName}.zip`);
const coreDirName = "core";

/**
 * Runs nostrclient build.
 * @returns {Promise<void>} Resolves when build is complete.
 */
async function main() {
  const buildToken = createBuildToken();
  await validateSourcePaths();
  await buildBundle(buildToken);

  const zipStats = await fs.stat(distZipFile);
  console.log(`[build:nostrclient] Done: ${distZipFile}`);
  console.log(`[build:nostrclient] Size: ${formatBytes(zipStats.size)}`);
  console.log(`[build:nostrclient] Build token: ${buildToken}`);
}

/**
 * Validates required source paths.
 * @returns {Promise<void>} Resolves when all source paths exist.
 */
async function validateSourcePaths() {
  const required = [
    [path.join(projectRoot, "integrations", "wordpress", "nostr-identity-link", "public", "identity-link"), "identity-link web app"],
    [path.join(projectRoot, "nostrclient"), "nostrclient source"],
    [path.join(projectRoot, "democlient", "nostr.js"), "nostr bridge module"],
    [path.join(projectRoot, "vendor", "ndk-3.0.0.js"), "vendor ndk"],
    [path.join(projectRoot, "signer.html"), "signer html"],
    [path.join(projectRoot, "signer-nip46.js"), "signer script"],
    [path.join(projectRoot, "signer-ui.css"), "signer css"],
    [path.join(projectRoot, "signer-ui.js"), "signer ui script"],
    [path.join(projectRoot, "sw.js"), "signer service worker"],
    [path.join(projectRoot, "manifest.webmanifest"), "signer manifest"],
    [path.join(projectRoot, "icons"), "signer icons"]
  ];

  for (const [targetPath, label] of required) {
    await assertPathExists(targetPath, label);
  }
}

/**
 * Builds nostrclient standalone bundle.
 * @param {string} buildToken Cache-busting token.
 * @returns {Promise<void>} Resolves when bundle is built.
 */
async function buildBundle(buildToken) {
  await ensureCleanDirectory(distRootDir);

  await copyDirectoryRecursive(
    path.join(projectRoot, "integrations", "wordpress", "nostr-identity-link", "public", "identity-link"),
    path.join(distBundleDir, "identity-link")
  );
  await copyDirectoryRecursive(path.join(projectRoot, "nostrclient"), path.join(distBundleDir, coreDirName));

  await copyFileWithParentDirs(path.join(projectRoot, "democlient", "nostr.js"), path.join(distBundleDir, "nostrclient", "nostr.js"));
  await copyFileWithParentDirs(path.join(projectRoot, "vendor", "ndk-3.0.0.js"), path.join(distBundleDir, "vendor", "ndk-3.0.0.js"));

  await copyFileWithParentDirs(path.join(projectRoot, "signer.html"), path.join(distBundleDir, "signer.html"));
  await copyFileWithParentDirs(path.join(projectRoot, "signer-nip46.js"), path.join(distBundleDir, "signer-nip46.js"));
  await copyFileWithParentDirs(path.join(projectRoot, "signer-ui.css"), path.join(distBundleDir, "signer-ui.css"));
  await copyFileWithParentDirs(path.join(projectRoot, "signer-ui.js"), path.join(distBundleDir, "signer-ui.js"));
  await copyFileWithParentDirs(path.join(projectRoot, "sw.js"), path.join(distBundleDir, "sw.js"));
  await copyFileWithParentDirs(path.join(projectRoot, "manifest.webmanifest"), path.join(distBundleDir, "manifest.webmanifest"));
  await copyDirectoryRecursive(path.join(projectRoot, "icons"), path.join(distBundleDir, "icons"));

  await patchIdentityLinkHtml(path.join(distBundleDir, "identity-link", "index.html"), buildToken);
  await createZipArchive(distBundleDir, distBundleName, distZipFile);
}

/**
 * Patches identity-link HTML for nostrclient standalone bundle.
 * @param {string} htmlFilePath HTML file path.
 * @param {string} buildToken Cache-busting token.
 * @returns {Promise<void>} Resolves when patching is complete.
 */
async function patchIdentityLinkHtml(htmlFilePath, buildToken) {
  let html = await fs.readFile(htmlFilePath, "utf8");

  html = html.replace(/data-signer-uri="[^"]*"/, 'data-signer-uri="../signer.html"');

  if (/data-use-new-core="[^"]*"/.test(html)) {
    html = html.replace(/data-use-new-core="[^"]*"/, 'data-use-new-core="true"');
  } else {
    html = html.replace(/data-auto-bind-on-unbound="[^"]*"/, '$&\n        data-use-new-core="true"');
  }

  const moduleUri = `../${coreDirName}/apps/identity-link/index.js?v=${buildToken}`;
  if (/data-new-core-module-uri="[^"]*"/.test(html)) {
    html = html.replace(/data-new-core-module-uri="[^"]*"/, `data-new-core-module-uri="${moduleUri}"`);
  } else {
    html = html.replace(/data-use-new-core="[^"]*"/, `$&\n        data-new-core-module-uri="${moduleUri}"`);
  }

  html = html.replace(
    /<script\s+type="module"\s+src="\.\/index\.js\?v=[^"]+"/,
    `<script type="module" src="./index.js?v=${buildToken}"`
  );

  await fs.writeFile(htmlFilePath, html, "utf8");
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[build:nostrclient] Failed: ${message}`);
  process.exitCode = 1;
});
