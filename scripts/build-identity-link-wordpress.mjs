import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const pluginSlug = "nostr-identity-link";
const sourcePluginDir = path.join(projectRoot, "integrations", "wordpress", pluginSlug);
const sourceNostrClientDir = path.join(projectRoot, "nostrclient");
const sourcePluginPhpFile = path.join(sourcePluginDir, `${pluginSlug}.php`);

const distRootDir = path.join(projectRoot, "dist", "wordpress");
const distPluginDir = path.join(distRootDir, pluginSlug);

/**
 * Entrypoint for the build script.
 * @returns {Promise<void>} Resolves when build is complete.
 */
async function main() {
  const buildToken = createBuildToken();
  const pluginVersion = await readPluginVersion(sourcePluginPhpFile);
  const zipOutputFile = path.join(distRootDir, `${pluginSlug}-${pluginVersion}.zip`);

  await validateSourcePaths();
  await buildWordPressPluginArtifact(buildToken, zipOutputFile);

  const zipStats = await fs.stat(zipOutputFile);
  console.log(`[build] Done: ${zipOutputFile}`);
  console.log(`[build] Size: ${formatBytes(zipStats.size)}`);
  console.log(`[build] Build token: ${buildToken}`);
}

/**
 * Validates required source paths.
 * @returns {Promise<void>} Resolves when all required paths exist.
 */
async function validateSourcePaths() {
  await assertPathExists(sourcePluginDir, "Plugin source directory");
  await assertPathExists(sourcePluginPhpFile, "Plugin main PHP file");
  await assertPathExists(path.join(sourcePluginDir, "public"), "Plugin public directory");
  await assertPathExists(path.join(sourceNostrClientDir, "apps"), "nostrclient apps directory");
  await assertPathExists(path.join(sourceNostrClientDir, "shared"), "nostrclient shared directory");
  await assertPathExists(
    path.join(sourceNostrClientDir, "integrations", "wordpress", "adapter"),
    "nostrclient WordPress adapter directory"
  );
}

/**
 * Builds the dist plugin folder and zip archive.
 * @param {string} buildToken Cache-busting token.
 * @param {string} zipOutputFile Output zip file path.
 * @returns {Promise<void>} Resolves when artifacts are created.
 */
async function buildWordPressPluginArtifact(buildToken, zipOutputFile) {
  await ensureCleanDirectory(distRootDir);

  await copyFileWithParentDirs(sourcePluginPhpFile, path.join(distPluginDir, `${pluginSlug}.php`));
  await copyDirectoryRecursive(path.join(sourcePluginDir, "public"), path.join(distPluginDir, "public"));

  await copyDirectoryRecursive(
    path.join(sourceNostrClientDir, "apps"),
    path.join(distPluginDir, "public", "nostrclient", "apps")
  );
  await copyDirectoryRecursive(
    path.join(sourceNostrClientDir, "shared"),
    path.join(distPluginDir, "public", "nostrclient", "shared")
  );
  await copyDirectoryRecursive(
    path.join(sourceNostrClientDir, "integrations", "wordpress", "adapter"),
    path.join(distPluginDir, "public", "nostrclient", "integrations", "wordpress", "adapter")
  );

  await patchIdentityLinkHtml(path.join(distPluginDir, "public", "identity-link", "index.html"), buildToken);
  await createZipArchive(distPluginDir, pluginSlug, zipOutputFile);
}

/**
 * Asserts that a path exists.
 * @param {string} targetPath Path to check.
 * @param {string} label Human-readable label.
 * @returns {Promise<void>} Resolves when path exists.
 */
async function assertPathExists(targetPath, label) {
  try {
    await fs.access(targetPath);
  } catch (_error) {
    throw new Error(`${label} missing: ${targetPath}`);
  }
}

/**
 * Ensures a directory exists and is empty.
 * @param {string} directory Directory path.
 * @returns {Promise<void>} Resolves when directory is clean.
 */
async function ensureCleanDirectory(directory) {
  await removePathIfExists(directory);
  await ensureDirectory(directory);
}

/**
 * Removes a file or directory when it exists.
 * @param {string} targetPath Target path.
 * @returns {Promise<void>} Resolves when path is removed or absent.
 */
async function removePathIfExists(targetPath) {
  try {
    await fs.rm(targetPath, { recursive: true, force: true });
  } catch (_error) {
    // no-op: rm(force) already handles most cases.
  }
}

/**
 * Ensures that a directory exists.
 * @param {string} directory Directory path.
 * @returns {Promise<void>} Resolves when directory exists.
 */
async function ensureDirectory(directory) {
  await fs.mkdir(directory, { recursive: true });
}

/**
 * Copies one file and creates parent directories as needed.
 * @param {string} sourceFile Source file path.
 * @param {string} destinationFile Destination file path.
 * @returns {Promise<void>} Resolves when file is copied.
 */
async function copyFileWithParentDirs(sourceFile, destinationFile) {
  await ensureDirectory(path.dirname(destinationFile));
  await fs.copyFile(sourceFile, destinationFile);
}

/**
 * Recursively copies a directory.
 * @param {string} sourceDir Source directory.
 * @param {string} destinationDir Destination directory.
 * @returns {Promise<void>} Resolves when copy is complete.
 */
async function copyDirectoryRecursive(sourceDir, destinationDir) {
  const entries = await fs.readdir(sourceDir, { withFileTypes: true });
  await ensureDirectory(destinationDir);

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const destinationPath = path.join(destinationDir, entry.name);

    if (entry.isDirectory()) {
      await copyDirectoryRecursive(sourcePath, destinationPath);
      continue;
    }

    if (entry.isFile()) {
      await copyFileWithParentDirs(sourcePath, destinationPath);
    }
  }
}

/**
 * Patches identity-link HTML in dist to activate nostrclient core path.
 * @param {string} htmlFilePath Dist HTML file path.
 * @param {string} buildToken Cache-busting token.
 * @returns {Promise<void>} Resolves when patching is complete.
 */
async function patchIdentityLinkHtml(htmlFilePath, buildToken) {
  let html = await fs.readFile(htmlFilePath, "utf8");
  const moduleUri = `../nostrclient/apps/identity-link/index.js?v=${buildToken}`;

  if (/data-use-new-core="[^"]*"/.test(html)) {
    html = html.replace(/data-use-new-core="[^"]*"/, 'data-use-new-core="true"');
  } else {
    html = html.replace(/data-auto-bind-on-unbound="[^"]*"/, '$&\n        data-use-new-core="true"');
  }

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

/**
 * Creates a zip archive from a source directory.
 * Uses ZIP method 0 (stored) to avoid external dependencies.
 * @param {string} sourceDirectory Directory to archive.
 * @param {string} rootFolderName Root folder name inside zip.
 * @param {string} outputFile Zip output path.
 * @returns {Promise<void>} Resolves when zip file is written.
 */
async function createZipArchive(sourceDirectory, rootFolderName, outputFile) {
  const entries = await collectFilesRecursive(sourceDirectory, rootFolderName);
  const zipBuffers = await buildZipChunks(entries);

  await ensureDirectory(path.dirname(outputFile));
  await fs.writeFile(outputFile, Buffer.concat(zipBuffers));
}

/**
 * Recursively collects file entries for zipping.
 * @param {string} sourceDirectory Base source directory.
 * @param {string} rootFolderName Root folder in zip.
 * @returns {Promise<Array<{absolutePath: string, zipPath: string}>>} Collected file entries.
 */
async function collectFilesRecursive(sourceDirectory, rootFolderName) {
  const out = [];

  /**
   * Walks one directory recursively.
   * @param {string} currentSource Current source directory.
   * @param {string} currentZipPrefix Current zip prefix.
   * @returns {Promise<void>} Resolves when traversal for this node is complete.
   */
  async function walk(currentSource, currentZipPrefix) {
    const dirEntries = await fs.readdir(currentSource, { withFileTypes: true });
    dirEntries.sort((a, b) => a.name.localeCompare(b.name));

    for (const entry of dirEntries) {
      const nextSource = path.join(currentSource, entry.name);
      const nextZip = path.posix.join(currentZipPrefix, entry.name);

      if (entry.isDirectory()) {
        await walk(nextSource, nextZip);
        continue;
      }

      if (entry.isFile()) {
        out.push({ absolutePath: nextSource, zipPath: nextZip });
      }
    }
  }

  await walk(sourceDirectory, rootFolderName);
  return out;
}

/**
 * Builds all zip binary chunks.
 * @param {Array<{absolutePath: string, zipPath: string}>} entries File entries.
 * @returns {Promise<Buffer[]>} Zip buffers.
 */
async function buildZipChunks(entries) {
  const localChunks = [];
  const centralChunks = [];

  let localOffset = 0;

  for (const entry of entries) {
    const fileData = await fs.readFile(entry.absolutePath);
    const fileStats = await fs.stat(entry.absolutePath);
    const zipPath = entry.zipPath.replace(/\\/g, "/");
    const fileNameBytes = Buffer.from(zipPath, "utf8");
    const { dosDate, dosTime } = toDosDateTime(fileStats.mtime);
    const fileCrc32 = crc32(fileData);

    const localHeader = createLocalFileHeader(fileNameBytes, fileCrc32, fileData.length, dosTime, dosDate);
    localChunks.push(localHeader, fileData);

    const centralHeader = createCentralDirectoryHeader(
      fileNameBytes,
      fileCrc32,
      fileData.length,
      dosTime,
      dosDate,
      localOffset
    );
    centralChunks.push(centralHeader);

    localOffset += localHeader.length + fileData.length;
  }

  const centralOffset = localOffset;
  const centralDirectorySize = centralChunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const endRecord = createEndOfCentralDirectoryRecord(entries.length, centralDirectorySize, centralOffset);

  return [...localChunks, ...centralChunks, endRecord];
}

/**
 * Creates one local file header buffer.
 * @param {Buffer} fileNameBytes UTF-8 encoded file name.
 * @param {number} fileCrc32 CRC32 checksum.
 * @param {number} fileSize File size in bytes.
 * @param {number} dosTime DOS time value.
 * @param {number} dosDate DOS date value.
 * @returns {Buffer} Local file header.
 */
function createLocalFileHeader(fileNameBytes, fileCrc32, fileSize, dosTime, dosDate) {
  const header = Buffer.alloc(30 + fileNameBytes.length);
  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(0, 6);
  header.writeUInt16LE(0, 8);
  header.writeUInt16LE(dosTime, 10);
  header.writeUInt16LE(dosDate, 12);
  header.writeUInt32LE(fileCrc32 >>> 0, 14);
  header.writeUInt32LE(fileSize >>> 0, 18);
  header.writeUInt32LE(fileSize >>> 0, 22);
  header.writeUInt16LE(fileNameBytes.length, 26);
  header.writeUInt16LE(0, 28);
  fileNameBytes.copy(header, 30);
  return header;
}

/**
 * Creates one central directory header buffer.
 * @param {Buffer} fileNameBytes UTF-8 encoded file name.
 * @param {number} fileCrc32 CRC32 checksum.
 * @param {number} fileSize File size in bytes.
 * @param {number} dosTime DOS time value.
 * @param {number} dosDate DOS date value.
 * @param {number} localHeaderOffset Offset to local header.
 * @returns {Buffer} Central directory header.
 */
function createCentralDirectoryHeader(fileNameBytes, fileCrc32, fileSize, dosTime, dosDate, localHeaderOffset) {
  const header = Buffer.alloc(46 + fileNameBytes.length);
  header.writeUInt32LE(0x02014b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(20, 6);
  header.writeUInt16LE(0, 8);
  header.writeUInt16LE(0, 10);
  header.writeUInt16LE(dosTime, 12);
  header.writeUInt16LE(dosDate, 14);
  header.writeUInt32LE(fileCrc32 >>> 0, 16);
  header.writeUInt32LE(fileSize >>> 0, 20);
  header.writeUInt32LE(fileSize >>> 0, 24);
  header.writeUInt16LE(fileNameBytes.length, 28);
  header.writeUInt16LE(0, 30);
  header.writeUInt16LE(0, 32);
  header.writeUInt16LE(0, 34);
  header.writeUInt16LE(0, 36);
  header.writeUInt32LE(0, 38);
  header.writeUInt32LE(localHeaderOffset >>> 0, 42);
  fileNameBytes.copy(header, 46);
  return header;
}

/**
 * Creates ZIP end-of-central-directory record.
 * @param {number} fileCount Number of files.
 * @param {number} centralSize Size of central directory.
 * @param {number} centralOffset Offset of central directory.
 * @returns {Buffer} End-of-central-directory record.
 */
function createEndOfCentralDirectoryRecord(fileCount, centralSize, centralOffset) {
  const record = Buffer.alloc(22);
  record.writeUInt32LE(0x06054b50, 0);
  record.writeUInt16LE(0, 4);
  record.writeUInt16LE(0, 6);
  record.writeUInt16LE(fileCount, 8);
  record.writeUInt16LE(fileCount, 10);
  record.writeUInt32LE(centralSize >>> 0, 12);
  record.writeUInt32LE(centralOffset >>> 0, 16);
  record.writeUInt16LE(0, 20);
  return record;
}

/**
 * Converts a JS date into DOS date/time values.
 * @param {Date} date Date instance.
 * @returns {{dosDate: number, dosTime: number}} DOS date/time.
 */
function toDosDateTime(date) {
  const year = Math.max(1980, date.getFullYear());
  const month = Math.max(1, date.getMonth() + 1);
  const day = Math.max(1, date.getDate());
  const hours = Math.max(0, date.getHours());
  const minutes = Math.max(0, date.getMinutes());
  const seconds = Math.max(0, Math.floor(date.getSeconds() / 2));

  const dosDate = ((year - 1980) << 9) | (month << 5) | day;
  const dosTime = (hours << 11) | (minutes << 5) | seconds;
  return { dosDate, dosTime };
}

/**
 * Builds the CRC32 lookup table.
 * @returns {Uint32Array} CRC32 table.
 */
function createCrc32Table() {
  const table = new Uint32Array(256);

  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c >>> 0;
  }

  return table;
}

const crc32Table = createCrc32Table();

/**
 * Calculates CRC32 checksum for a buffer.
 * @param {Buffer} buffer Input bytes.
 * @returns {number} CRC32 value.
 */
function crc32(buffer) {
  let crc = 0 ^ -1;

  for (let i = 0; i < buffer.length; i += 1) {
    crc = (crc >>> 8) ^ crc32Table[(crc ^ buffer[i]) & 0xff];
  }

  return (crc ^ -1) >>> 0;
}

/**
 * Reads plugin version from plugin PHP header.
 * @param {string} pluginPhpFile Plugin main PHP file path.
 * @returns {Promise<string>} Version string.
 */
async function readPluginVersion(pluginPhpFile) {
  const phpSource = await fs.readFile(pluginPhpFile, "utf8");
  const versionMatch = phpSource.match(/\n\s*\*\s*Version:\s*([^\r\n]+)/i);
  if (!versionMatch) {
    return "0.0.0";
  }
  return String(versionMatch[1] || "0.0.0").trim().replace(/[^0-9A-Za-z._-]/g, "-");
}

/**
 * Creates a compact UTC build token used for cache-busting.
 * @returns {string} Build token.
 */
function createBuildToken() {
  const now = new Date();
  const yyyy = String(now.getUTCFullYear()).padStart(4, "0");
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(now.getUTCDate()).padStart(2, "0");
  const hh = String(now.getUTCHours()).padStart(2, "0");
  const mi = String(now.getUTCMinutes()).padStart(2, "0");
  const ss = String(now.getUTCSeconds()).padStart(2, "0");
  return `${yyyy}${mm}${dd}${hh}${mi}${ss}`;
}

/**
 * Formats bytes into a human-readable string.
 * @param {number} byteCount Byte count.
 * @returns {string} Formatted value.
 */
function formatBytes(byteCount) {
  const bytes = Number(byteCount || 0);
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KiB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MiB`;
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[build] Failed: ${message}`);
  process.exitCode = 1;
});
