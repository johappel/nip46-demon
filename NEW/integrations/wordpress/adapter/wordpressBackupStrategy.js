import { createWordPressHeaders } from "./config.js";

/**
 * Creates the WordPress backup strategy.
 * @param {{ apiBaseUrl: string, restNonce: string }} config Adapter config.
 * @returns {{ getBackupStatus: Function, saveBackup: Function, loadBackup: Function }} Backup strategy.
 */
export function createWordPressBackupStrategy(config) {
  return {
    /**
     * Loads backup status metadata.
     * @returns {Promise<object>} Backup status response.
     */
    async getBackupStatus() {
      const response = await fetch(config.apiBaseUrl + "/backup", {
        method: "GET",
        headers: createWordPressHeaders(config),
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error("WordPress backup status request failed: " + response.status);
      }

      return await response.json();
    },

    /**
     * Saves encrypted backup payload.
     * @param {object} payload Export payload.
     * @returns {Promise<object>} Save result.
     */
    async saveBackup(payload) {
      const response = await fetch(config.apiBaseUrl + "/backup", {
        method: "POST",
        headers: createWordPressHeaders(config),
        body: JSON.stringify({ backup: payload }),
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error("WordPress backup save request failed: " + response.status);
      }

      return await response.json();
    },

    /**
     * Loads encrypted backup payload.
     * @returns {Promise<object|null>} Backup payload.
     */
    async loadBackup() {
      const response = await fetch(config.apiBaseUrl + "/backup", {
        method: "GET",
        headers: createWordPressHeaders(config),
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error("WordPress backup load request failed: " + response.status);
      }

      const data = await response.json();
      return data.backup || null;
    }
  };
}