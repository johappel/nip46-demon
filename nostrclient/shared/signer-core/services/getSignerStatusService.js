import { SignerStatus } from "../state.js";

/**
 * Loads signer status through the configured bridge port.
 * @param {{ signerBridgePort: { getSignerStatus: Function } }} deps Dependencies.
 * @returns {Promise<{ status: string, activePubkey: string, activeKeyId: string, locked: boolean }>} Service result.
 */
export async function getSignerStatusService(deps) {
  const result = await deps.signerBridgePort.getSignerStatus();
  return {
    status: result.locked ? SignerStatus.LOCKED : SignerStatus.READY,
    activePubkey: result.activePubkey || "",
    activeKeyId: result.activeKeyId || "",
    locked: Boolean(result.locked)
  };
}