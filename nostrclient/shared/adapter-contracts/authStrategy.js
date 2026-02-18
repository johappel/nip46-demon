/**
 * Validates that the provided value is a function.
 * @param {unknown} candidate Candidate value.
 * @param {string} functionName Function name used in error messages.
 * @returns {void}
 * @throws {TypeError} Thrown when candidate is not a function.
 */
function assertFunction(candidate, functionName) {
  if (typeof candidate !== "function") {
    throw new TypeError("AuthStrategy must implement " + functionName + "().");
  }
}

/**
 * Validates an AuthStrategy implementation.
 * @param {unknown} strategy Strategy object.
 * @returns {{ getNonceOrToken: Function, ensureAuthorized: Function }} Validated strategy.
 * @throws {TypeError} Thrown when the contract is not met.
 */
export function validateAuthStrategy(strategy) {
  if (!strategy || typeof strategy !== "object") {
    throw new TypeError("AuthStrategy must be an object.");
  }

  assertFunction(strategy.getNonceOrToken, "getNonceOrToken");
  assertFunction(strategy.ensureAuthorized, "ensureAuthorized");
  return strategy;
}