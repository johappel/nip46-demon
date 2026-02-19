import { runIdentityLinkSync } from "../../shared/identity-link-core/index.js";
import { createWordPressAdapterBundle } from "../../integrations/wordpress/adapter/index.js";

/**
 * Creates a basic bridge client wrapper around an existing RPC transport.
 * @param {{ request: Function }} rpcClient Existing RPC client.
 * @returns {{ send: Function }} Bridge wrapper.
 */
export function createBridgeClient(rpcClient) {
  return {
    /**
     * Sends an RPC request.
     * @param {string} method RPC method.
     * @param {object} params RPC params.
     * @returns {Promise<object>} RPC response payload.
     */
    async send(method, params) {
      return await rpcClient.request(method, params);
    }
  };
}

/**
 * Runs identity-link sync through the nostrclient architecture path.
 * @param {{ apiBaseUrl: string, restNonce?: string }} adapterConfig Adapter configuration.
 * @param {{ request: Function }} rpcClient Existing RPC client.
 * @returns {Promise<object>} Sync result state.
 */
export async function runNewIdentityLinkFlow(adapterConfig, rpcClient) {
  const bridgeClient = createBridgeClient(rpcClient);
  const adapterBundle = createWordPressAdapterBundle(adapterConfig, bridgeClient);
  return await runIdentityLinkSync(adapterBundle);
}
