import { createWordPressAdapterConfig } from "./config.js";
import { createWordPressAuthStrategy } from "./wordpressAuthStrategy.js";
import { createWordPressBackupStrategy } from "./wordpressBackupStrategy.js";
import { createWordPressBindingStrategy } from "./wordpressBindingStrategy.js";
import { createWordPressIdentityStrategy } from "./wordpressIdentityStrategy.js";
import { createWordPressSignerBridgePort } from "./wordpressSignerBridgePort.js";

/**
 * Creates a complete WordPress adapter bundle that satisfies adapter contracts.
 * @param {{ apiBaseUrl: string, restNonce?: string }} rawConfig Raw adapter config.
 * @param {{ send: Function }} bridgeClient Bridge client implementation.
 * @returns {{
 *  identityStrategy: object,
 *  bindingStrategy: object,
 *  backupStrategy: object,
 *  authStrategy: object,
 *  signerBridgePort: object
 * }} Adapter bundle.
 */
export function createWordPressAdapterBundle(rawConfig, bridgeClient) {
  const config = createWordPressAdapterConfig(rawConfig);

  return {
    identityStrategy: createWordPressIdentityStrategy(config),
    bindingStrategy: createWordPressBindingStrategy(config),
    backupStrategy: createWordPressBackupStrategy(config),
    authStrategy: createWordPressAuthStrategy(config),
    signerBridgePort: createWordPressSignerBridgePort(bridgeClient)
  };
}