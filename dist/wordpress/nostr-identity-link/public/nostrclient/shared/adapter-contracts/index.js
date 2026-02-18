import { validateAuthStrategy } from "./authStrategy.js";
import { validateBackupStrategy } from "./backupStrategy.js";
import { validateBindingStrategy } from "./bindingStrategy.js";
import { validateIdentityStrategy } from "./identityStrategy.js";
import { validateSignerBridgePort } from "./signerBridgePort.js";

/**
 * Validates and returns a complete adapter bundle.
 * @param {unknown} bundle Adapter bundle candidate.
 * @returns {{
 *  identityStrategy: object,
 *  bindingStrategy: object,
 *  backupStrategy: object,
 *  authStrategy: object,
 *  signerBridgePort: object
 * }} Validated bundle.
 * @throws {TypeError} Thrown when the contract is not met.
 */
export function validateAdapterBundle(bundle) {
  if (!bundle || typeof bundle !== "object") {
    throw new TypeError("Adapter bundle must be an object.");
  }

  return {
    identityStrategy: validateIdentityStrategy(bundle.identityStrategy),
    bindingStrategy: validateBindingStrategy(bundle.bindingStrategy),
    backupStrategy: validateBackupStrategy(bundle.backupStrategy),
    authStrategy: validateAuthStrategy(bundle.authStrategy),
    signerBridgePort: validateSignerBridgePort(bundle.signerBridgePort)
  };
}