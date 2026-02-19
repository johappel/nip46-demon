import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertPathExists,
  copyDirectoryRecursive,
  copyFileWithParentDirs,
  createBuildToken,
  ensureCleanDirectory,
  formatBytes
} from "./build-utils.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const distRootDir = path.join(projectRoot, "dist", "pages");

/**
 * Runs GitHub Pages build for signer and democlient.
 * @returns {Promise<void>} Resolves when build is complete.
 */
async function main() {
  const buildToken = createBuildToken();
  await validateSourcePaths();
  await buildPagesBundle(buildToken);

  const totalSize = await getDirectorySize(distRootDir);
  console.log(`[build:pages] Done: ${distRootDir}`);
  console.log(`[build:pages] Size: ${formatBytes(totalSize)}`);
  console.log(`[build:pages] Build token: ${buildToken}`);
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
    [path.join(projectRoot, "democlient"), "democlient source"],
    [path.join(projectRoot, "nostrclient", "shared", "nostr.js"), "nostr bridge module"],
    [path.join(projectRoot, "vendor", "ndk-3.0.0.js"), "vendor ndk"]
  ];

  for (const [targetPath, label] of required) {
    await assertPathExists(targetPath, label);
  }
}

/**
 * Builds one GitHub Pages deploy bundle.
 * @param {string} buildToken Cache-busting token.
 * @returns {Promise<void>} Resolves when bundle is built.
 */
async function buildPagesBundle(buildToken) {
  await ensureCleanDirectory(distRootDir);

  await copySignerAssets();
  await copyDemoclientAssets();
  await patchSignerHtml(path.join(distRootDir, "signer.html"), buildToken);
  await writeDemoclientRedirect(path.join(distRootDir, "democlient.html"));
  await writeRootIndex(path.join(distRootDir, "index.html"));
  await writeNoJekyllFile(path.join(distRootDir, ".nojekyll"));
}

/**
 * Copies signer files to pages root.
 * @returns {Promise<void>} Resolves when copy is complete.
 */
async function copySignerAssets() {
  await copyFileWithParentDirs(path.join(projectRoot, "signer.html"), path.join(distRootDir, "signer.html"));
  await copyFileWithParentDirs(path.join(projectRoot, "signer-nip46.js"), path.join(distRootDir, "signer-nip46.js"));
  await copyFileWithParentDirs(path.join(projectRoot, "signer-ui.css"), path.join(distRootDir, "signer-ui.css"));
  await copyFileWithParentDirs(path.join(projectRoot, "signer-ui.js"), path.join(distRootDir, "signer-ui.js"));
  await copyFileWithParentDirs(path.join(projectRoot, "sw.js"), path.join(distRootDir, "sw.js"));
  await copyFileWithParentDirs(path.join(projectRoot, "manifest.webmanifest"), path.join(distRootDir, "manifest.webmanifest"));
  await copyDirectoryRecursive(path.join(projectRoot, "icons"), path.join(distRootDir, "icons"));
  await copyFileWithParentDirs(path.join(projectRoot, "vendor", "ndk-3.0.0.js"), path.join(distRootDir, "vendor", "ndk-3.0.0.js"));
}

/**
 * Copies democlient files and runtime bridge dependencies.
 * @returns {Promise<void>} Resolves when copy is complete.
 */
async function copyDemoclientAssets() {
  await copyDirectoryRecursive(path.join(projectRoot, "democlient"), path.join(distRootDir, "democlient"));
  await copyFileWithParentDirs(
    path.join(projectRoot, "nostrclient", "shared", "nostr.js"),
    path.join(distRootDir, "nostrclient", "shared", "nostr.js")
  );
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

/**
 * Writes one democlient redirect page for convenience URLs.
 * @param {string} filePath Redirect file path.
 * @returns {Promise<void>} Resolves when file is written.
 */
async function writeDemoclientRedirect(filePath) {
  const html =
    "<!DOCTYPE html>\n" +
    "<html lang=\"de\">\n" +
    "<head>\n" +
    "  <meta charset=\"UTF-8\">\n" +
    "  <meta http-equiv=\"refresh\" content=\"0; url=./democlient/\">\n" +
    "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n" +
    "  <title>Weiterleitung zum Democlient</title>\n" +
    "</head>\n" +
    "<body>\n" +
    "  <p>Weiterleitung zu <a href=\"./democlient/\">./democlient/</a> ...</p>\n" +
    "  <script>window.location.replace('./democlient/');</script>\n" +
    "</body>\n" +
    "</html>\n";

  await fs.writeFile(filePath, html, "utf8");
}

/**
 * Writes one root index page with signer and democlient links.
 * @param {string} filePath Output file path.
 * @returns {Promise<void>} Resolves when file is written.
 */
async function writeRootIndex(filePath) {
  const html =
    "<!DOCTYPE html>\n" +
    "<html lang=\"de\">\n" +
    "<head>\n" +
    "  <meta charset=\"UTF-8\">\n" +
    "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n" +
    "  <title>NIP-46 Pages Build</title>\n" +
    "  <style>\n" +
    "    body { font-family: Arial, sans-serif; margin: 2rem; line-height: 1.45; }\n" +
    "    h1 { margin-bottom: 0.5rem; }\n" +
    "    ul { padding-left: 1.2rem; }\n" +
    "    a { color: #0b63c8; }\n" +
    "    code { background: #f3f3f3; padding: 0.1rem 0.35rem; border-radius: 4px; }\n" +
    "  </style>\n" +
    "</head>\n" +
    "<body>\n" +
    "  <h1>NIP-46 GitHub Pages Bundle</h1>\n" +
    "  <p>Startpunkte:</p>\n" +
    "  <ul>\n" +
    "    <li><a href=\"./signer.html\">Signer</a></li>\n" +
    "    <li><a href=\"./democlient/\">Democlient</a></li>\n" +
    "    <li><a href=\"./democlient.html\">Democlient (redirect)</a></li>\n" +
    "  </ul>\n" +
    "  <p>Bridge-Modulpfad: <code>./nostrclient/shared/nostr.js</code></p>\n" +
    "</body>\n" +
    "</html>\n";

  await fs.writeFile(filePath, html, "utf8");
}

/**
 * Writes `.nojekyll` marker to avoid Jekyll processing on Pages.
 * @param {string} filePath Output file path.
 * @returns {Promise<void>} Resolves when file is written.
 */
async function writeNoJekyllFile(filePath) {
  await fs.writeFile(filePath, "", "utf8");
}

/**
 * Calculates recursive size of one directory.
 * @param {string} directory Directory path.
 * @returns {Promise<number>} Total size in bytes.
 */
async function getDirectorySize(directory) {
  let total = 0;
  const entries = await fs.readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      total += await getDirectorySize(absolutePath);
      continue;
    }
    if (entry.isFile()) {
      const fileStats = await fs.stat(absolutePath);
      total += fileStats.size;
    }
  }

  return total;
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[build:pages] Failed: ${message}`);
  process.exitCode = 1;
});
