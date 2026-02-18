/**
 * Validates that the provided value is a function.
 * @param {unknown} candidate Candidate value.
 * @param {string} functionName Function name used in error messages.
 * @returns {void}
 * @throws {TypeError} Thrown when candidate is not a function.
 */
function assertFunction(candidate, functionName) {
  if (typeof candidate !== "function") {
    throw new TypeError("BackupStrategy must implement " + functionName + "().");
  }
}

/**
 * Validates a BackupStrategy implementation.
 * @param {unknown} strategy Strategy object.
 * @returns {{ getBackupStatus: Function, saveBackup: Function, loadBackup: Function }} Validated strategy.
 * @throws {TypeError} Thrown when the contract is not met.
 */
export function validateBackupStrategy(strategy) {
  if (!strategy || typeof strategy !== "object") {
    throw new TypeError("BackupStrategy must be an object.");
  }

  assertFunction(strategy.getBackupStatus, "getBackupStatus");
  assertFunction(strategy.saveBackup, "saveBackup");
  assertFunction(strategy.loadBackup, "loadBackup");
  return strategy;
}