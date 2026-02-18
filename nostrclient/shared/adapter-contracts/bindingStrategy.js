/**
 * Validates that the provided value is a function.
 * @param {unknown} candidate Candidate value.
 * @param {string} functionName Function name used in error messages.
 * @returns {void}
 * @throws {TypeError} Thrown when candidate is not a function.
 */
function assertFunction(candidate, functionName) {
  if (typeof candidate !== "function") {
    throw new TypeError("BindingStrategy must implement " + functionName + "().");
  }
}

/**
 * Validates a BindingStrategy implementation.
 * @param {unknown} strategy Strategy object.
 * @returns {{ getExpectedPubkey: Function, bindPubkey: Function, rebindPubkey: Function }} Validated strategy.
 * @throws {TypeError} Thrown when the contract is not met.
 */
export function validateBindingStrategy(strategy) {
  if (!strategy || typeof strategy !== "object") {
    throw new TypeError("BindingStrategy must be an object.");
  }

  assertFunction(strategy.getExpectedPubkey, "getExpectedPubkey");
  assertFunction(strategy.bindPubkey, "bindPubkey");
  assertFunction(strategy.rebindPubkey, "rebindPubkey");
  return strategy;
}