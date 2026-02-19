/**
 * Validates that the provided value is a function.
 * @param {unknown} candidate Candidate value.
 * @param {string} functionName Function name used in error messages.
 * @returns {void}
 * @throws {TypeError} Thrown when candidate is not a function.
 */
function assertFunction(candidate, functionName) {
  if (typeof candidate !== "function") {
    throw new TypeError("SignerBridgePort must implement " + functionName + "().");
  }
}

/**
 * Validates a SignerBridgePort implementation.
 * @param {unknown} port Port object.
 * @returns {{ ensureUserKey: Function, getSignerStatus: Function, switchKey?: Function }} Validated port.
 * @throws {TypeError} Thrown when the contract is not met.
 */
export function validateSignerBridgePort(port) {
  if (!port || typeof port !== "object") {
    throw new TypeError("SignerBridgePort must be an object.");
  }

  assertFunction(port.ensureUserKey, "ensureUserKey");
  assertFunction(port.getSignerStatus, "getSignerStatus");
  if (typeof port.switchKey !== "undefined") {
    assertFunction(port.switchKey, "switchKey");
  }
  return port;
}