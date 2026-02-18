/**
 * Creates the WordPress auth strategy.
 * @param {{ restNonce: string }} config Adapter config.
 * @returns {{ getNonceOrToken: Function, ensureAuthorized: Function }} Auth strategy.
 */
export function createWordPressAuthStrategy(config) {
  return {
    /**
     * Returns the current REST nonce.
     * @returns {Promise<string>} Current nonce.
     */
    async getNonceOrToken() {
      return config.restNonce || "";
    },

    /**
     * Checks that authorization data is present.
     * @returns {Promise<void>} Resolves when auth context is present.
     * @throws {Error} Thrown when nonce is missing.
     */
    async ensureAuthorized() {
      if (!config.restNonce) {
        throw new Error("Missing WordPress nonce for authorized REST calls.");
      }
    }
  };
}