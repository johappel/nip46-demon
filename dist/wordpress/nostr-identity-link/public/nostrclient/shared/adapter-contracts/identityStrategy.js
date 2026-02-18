/**
 * Validates that the provided value is a function.
 * @param {unknown} candidate Candidate value.
 * @param {string} functionName Function name used in error messages.
 * @returns {void}
 * @throws {TypeError} Thrown when candidate is not a function.
 */
function assertFunction(candidate, functionName) {
  if (typeof candidate !== "function") {
    throw new TypeError("IdentityStrategy must implement " + functionName + "().");
  }
}

/**
 * Validates an IdentityStrategy implementation.
 * @param {unknown} strategy Strategy object.
 * @returns {{ getSessionIdentity: Function, normalizeSubject: Function }} Validated strategy.
 * @throws {TypeError} Thrown when the contract is not met.
 */
export function validateIdentityStrategy(strategy) {
  if (!strategy || typeof strategy !== "object") {
    throw new TypeError("IdentityStrategy must be an object.");
  }

  assertFunction(strategy.getSessionIdentity, "getSessionIdentity");
  assertFunction(strategy.normalizeSubject, "normalizeSubject");
  return strategy;
}