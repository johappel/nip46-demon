import { createWordPressHeaders } from "./config.js";

/**
 * Creates the WordPress identity strategy.
 * @param {{ apiBaseUrl: string, restNonce: string }} config Adapter config.
 * @returns {{ getSessionIdentity: Function, normalizeSubject: Function }} Identity strategy.
 */
export function createWordPressIdentityStrategy(config) {
  return {
    /**
     * Loads the current WordPress-backed session identity.
     * @returns {Promise<{ provider: string, subject: string, displayName: string, expectedPubkey: string }>} Session identity.
     */
    async getSessionIdentity() {
      const response = await fetch(config.apiBaseUrl + "/session", {
        method: "GET",
        headers: createWordPressHeaders(config),
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error("WordPress session request failed: " + response.status);
      }

      return await response.json();
    },

    /**
     * Normalizes a WordPress subject identifier.
     * @param {string|number} rawSubject Raw subject value.
     * @returns {string} Normalized subject.
     */
    normalizeSubject(rawSubject) {
      return String(rawSubject || "").trim();
    }
  };
}