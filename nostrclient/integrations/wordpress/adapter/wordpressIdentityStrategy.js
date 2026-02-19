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
        credentials: "include",
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error("WordPress session request failed: " + response.status);
      }

      const payload = await response.json();
      const source =
        payload && typeof payload.identity === "object" && payload.identity
          ? payload.identity
          : payload;
      return {
        provider: String(source?.provider || "wordpress").trim().toLowerCase() || "wordpress",
        subject: String(source?.subject ?? source?.userId ?? "").trim(),
        displayName: String(source?.displayName ?? source?.username ?? source?.name ?? "").trim(),
        expectedPubkey: String(source?.expectedPubkey ?? source?.pubkey ?? "").trim().toLowerCase()
      };
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
