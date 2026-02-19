import fs from "node:fs/promises";
import path from "node:path";

/**
 * Asserts that a path exists.
 * @param {string} targetPath Path to check.
 * @param {string} label Human-readable label.
 * @returns {Promise<void>} Resolves when path exists.
 */
export async function assertPathExists(targetPath, label) {
  try {
    await fs.access(targetPath);
  } catch (_error) {
    throw new Error(`${label} missing: ${targetPath}`);
  }
}

/**
 * Ensures a directory exists.
 * @param {string} directory Directory path.
 * @returns {Promise<void>} Resolves when directory exists.
 */
export async function ensureDirectory(directory) {
  await fs.mkdir(directory, { recursive: true });
}

/**
 * Removes a path when it exists.
 * @param {string} targetPath File or directory path.
 * @returns {Promise<void>} Resolves when path is removed or absent.
 */
export async function removePathIfExists(targetPath) {
  try {
    await fs.rm(targetPath, { recursive: true, force: true });
  } catch (_error) {
    // no-op
  }
}

/**
 * Ensures that a directory is empty.
 * @param {string} directory Directory path.
 * @returns {Promise<void>} Resolves when directory is clean.
 */
export async function ensureCleanDirectory(directory) {
  await removePathIfExists(directory);
  await ensureDirectory(directory);
}

/**
 * Copies one file and ensures destination parent directories exist.
 * @param {string} sourceFile Source file path.
 * @param {string} destinationFile Destination file path.
 * @returns {Promise<void>} Resolves when copy is complete.
 */
export async function copyFileWithParentDirs(sourceFile, destinationFile) {
  await ensureDirectory(path.dirname(destinationFile));
  await fs.copyFile(sourceFile, destinationFile);
}

/**
 * Copies one directory recursively.
 * @param {string} sourceDir Source directory path.
 * @param {string} destinationDir Destination directory path.
 * @returns {Promise<void>} Resolves when copy is complete.
 */
export async function copyDirectoryRecursive(sourceDir, destinationDir) {
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
 * Creates a compact UTC build token.
 * @returns {string} Build token.
 */
export function createBuildToken() {
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
 * Formats bytes for log output.
 * @param {number} byteCount Byte count.
 * @returns {string} Human-readable size.
 */
export function formatBytes(byteCount) {
  const bytes = Number(byteCount || 0);
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KiB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MiB`;
}

/**
 * Creates a zip archive from one source directory.
 * Uses ZIP method 0 (stored) and does not require external dependencies.
 * @param {string} sourceDirectory Source directory path.
 * @param {string} rootFolderName Root folder name inside zip archive.
 * @param {string} outputFile Output zip file path.
 * @returns {Promise<void>} Resolves when zip file is written.
 */
export async function createZipArchive(sourceDirectory, rootFolderName, outputFile) {
  const entries = await collectFilesRecursive(sourceDirectory, rootFolderName);
  const zipChunks = await buildZipChunks(entries);

  await ensureDirectory(path.dirname(outputFile));
  await fs.writeFile(outputFile, Buffer.concat(zipChunks));
}

/**
 * Recursively collects file entries from one directory.
 * @param {string} sourceDirectory Source directory.
 * @param {string} rootFolderName Root folder name used in zip paths.
 * @returns {Promise<Array<{absolutePath: string, zipPath: string}>>} File entries.
 */
async function collectFilesRecursive(sourceDirectory, rootFolderName) {
  const out = [];

  /**
   * Walks one directory recursively.
   * @param {string} currentSource Current source directory.
   * @param {string} currentZipPrefix Current zip prefix.
   * @returns {Promise<void>} Resolves when traversal is complete.
   */
  async function walk(currentSource, currentZipPrefix) {
    const entries = await fs.readdir(currentSource, { withFileTypes: true });
    entries.sort((a, b) => a.name.localeCompare(b.name));

    for (const entry of entries) {
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
 * Builds ZIP binary chunks from file entries.
 * @param {Array<{absolutePath: string, zipPath: string}>} entries File entries.
 * @returns {Promise<Buffer[]>} ZIP buffers.
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
  const centralSize = centralChunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const endRecord = createEndOfCentralDirectoryRecord(entries.length, centralSize, centralOffset);

  return [...localChunks, ...centralChunks, endRecord];
}

/**
 * Creates a local file header.
 * @param {Buffer} fileNameBytes File name bytes.
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
 * Creates a central directory header.
 * @param {Buffer} fileNameBytes File name bytes.
 * @param {number} fileCrc32 CRC32 checksum.
 * @param {number} fileSize File size in bytes.
 * @param {number} dosTime DOS time value.
 * @param {number} dosDate DOS date value.
 * @param {number} localHeaderOffset Local header offset.
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
 * Creates end-of-central-directory record.
 * @param {number} fileCount Number of files.
 * @param {number} centralSize Central directory size.
 * @param {number} centralOffset Central directory offset.
 * @returns {Buffer} End record.
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
 * Converts JS date into DOS date/time values.
 * @param {Date} date Date value.
 * @returns {{dosDate: number, dosTime: number}} DOS date and time.
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
 * Builds CRC32 lookup table.
 * @returns {Uint32Array} CRC32 lookup table.
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
 * Calculates CRC32 checksum.
 * @param {Buffer} buffer Input bytes.
 * @returns {number} CRC32 value.
 */
function crc32(buffer) {
  let crc = 0 ^ -1;

  for (let index = 0; index < buffer.length; index += 1) {
    crc = (crc >>> 8) ^ crc32Table[(crc ^ buffer[index]) & 0xff];
  }

  return (crc ^ -1) >>> 0;
}