/**
 * Creates the WordPress signer bridge port.
 * @param {{ send: Function }} bridgeClient Bridge client implementation.
 * @returns {{ ensureUserKey: Function, getSignerStatus: Function }} Signer bridge port.
 */
export function createWordPressSignerBridgePort(bridgeClient) {
  return {
    /**
     * Ensures a signer key for a backend identity.
     * @param {{ provider: string, subject: string, displayName?: string }} input Request payload.
     * @returns {Promise<{ pubkey: string, npub: string, keyId: string }>} Signer result.
     */
    async ensureUserKey(input) {
      return await bridgeClient.send("wp-ensure-user-key", input);
    },

    /**
     * Reads current signer status.
     * @returns {Promise<{ locked: boolean, activePubkey: string, activeKeyId: string }>} Signer status.
     */
    async getSignerStatus() {
      return await bridgeClient.send("signer-status", {});
    }
  };
}