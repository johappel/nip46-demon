/** @type {{ IDLE: string, READY: string, LOCKED: string, ERROR: string }} */
export const SignerStatus = {
  IDLE: "idle",
  READY: "ready",
  LOCKED: "locked",
  ERROR: "error"
};

/**
 * Creates the initial signer-core state.
 * @returns {{ status: string, activePubkey: string, activeKeyId: string, lastError: string }} Initial state.
 */
export function createInitialSignerState() {
  return {
    status: SignerStatus.IDLE,
    activePubkey: "",
    activeKeyId: "",
    lastError: ""
  };
}