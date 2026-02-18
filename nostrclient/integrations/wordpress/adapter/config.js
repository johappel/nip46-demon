/**
 * Builds a normalized WordPress adapter config.
 * @param {{ apiBaseUrl: string, restNonce?: string }} rawConfig Raw config.
 * @returns {{ apiBaseUrl: string, restNonce: string }} Normalized config.
 * @throws {TypeError} Thrown when apiBaseUrl is invalid.
 */
export function createWordPressAdapterConfig(rawConfig) {
  if (!rawConfig || typeof rawConfig.apiBaseUrl !== "string" || rawConfig.apiBaseUrl.trim() === "") {
    throw new TypeError("WordPress adapter requires apiBaseUrl.");
  }

  return {
    apiBaseUrl: rawConfig.apiBaseUrl.replace(/\/$/, ""),
    restNonce: rawConfig.restNonce || ""
  };
}

/**
 * Creates default fetch headers for WordPress REST calls.
 * @param {{ restNonce: string }} config Normalized adapter config.
 * @returns {Record<string, string>} Request headers.
 */
export function createWordPressHeaders(config) {
  const headers = {
    "Content-Type": "application/json"
  };

  if (config.restNonce) {
    headers["X-WP-Nonce"] = config.restNonce;
  }

  return headers;
}