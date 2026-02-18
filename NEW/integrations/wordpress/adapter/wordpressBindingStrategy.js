import { createWordPressHeaders } from "./config.js";

/**
 * Creates the WordPress binding strategy.
 * @param {{ apiBaseUrl: string, restNonce: string }} config Adapter config.
 * @returns {{ getExpectedPubkey: Function, bindPubkey: Function, rebindPubkey: Function }} Binding strategy.
 */
export function createWordPressBindingStrategy(config) {
  return {
    /**
     * Reads expected pubkey for a subject from backend session endpoint.
     * @param {string} _subject User subject.
     * @returns {Promise<string>} Expected pubkey.
     */
    async getExpectedPubkey(_subject) {
      const response = await fetch(config.apiBaseUrl + "/session", {
        method: "GET",
        headers: createWordPressHeaders(config),
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error("WordPress expected pubkey request failed: " + response.status);
      }

      const payload = await response.json();
      return payload.expectedPubkey || "";
    },

    /**
     * Creates initial binding for a subject.
     * @param {string} subject User subject.
     * @param {{ pubkey: string, npub?: string, keyId?: string }} binding Binding payload.
     * @returns {Promise<object>} API response payload.
     */
    async bindPubkey(subject, binding) {
      const response = await fetch(config.apiBaseUrl + "/bind", {
        method: "POST",
        headers: createWordPressHeaders(config),
        body: JSON.stringify({ subject, ...binding }),
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error("WordPress bind request failed: " + response.status);
      }

      return await response.json();
    },

    /**
     * Rebinds a subject from old pubkey to new pubkey.
     * @param {string} subject User subject.
     * @param {string} oldPubkey Previously bound pubkey.
     * @param {string} newPubkey New pubkey.
     * @returns {Promise<object>} API response payload.
     */
    async rebindPubkey(subject, oldPubkey, newPubkey) {
      const response = await fetch(config.apiBaseUrl + "/rebind", {
        method: "POST",
        headers: createWordPressHeaders(config),
        body: JSON.stringify({ subject, oldPubkey, newPubkey }),
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error("WordPress rebind request failed: " + response.status);
      }

      return await response.json();
    }
  };
}