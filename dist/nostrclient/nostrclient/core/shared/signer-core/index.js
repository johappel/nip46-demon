import { validateSignerBridgePort } from "../adapter-contracts/signerBridgePort.js";
import { createInitialSignerState } from "./state.js";
import { getSignerStatusService } from "./services/getSignerStatusService.js";

/**
 * Creates a small signer-core API facade.
 * @param {{ signerBridgePort: unknown }} deps Dependencies.
 * @returns {{ loadStatus: Function }} API facade.
 */
export function createSignerCoreApi(deps) {
  const bridgePort = validateSignerBridgePort(deps.signerBridgePort);

  return {
    /**
     * Loads current signer status.
     * @returns {Promise<object>} Current signer state.
     */
    async loadStatus() {
      const state = createInitialSignerState();
      const status = await getSignerStatusService({ signerBridgePort: bridgePort });
      return { ...state, ...status };
    }
  };
}