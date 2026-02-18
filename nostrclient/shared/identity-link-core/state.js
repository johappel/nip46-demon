/** @type {{ IDLE: string, LOADING: string, UNBOUND: string, MATCHED: string, MISMATCHED: string, LOCKED: string, ERROR: string }} */
export const IdentityLinkStatus = {
  IDLE: "idle",
  LOADING: "loading",
  UNBOUND: "unbound",
  MATCHED: "matched",
  MISMATCHED: "mismatched",
  LOCKED: "locked",
  ERROR: "error"
};

/**
 * Creates the initial state for identity-link workflows.
 * @returns {{
 *  status: string,
 *  identity: null | { provider: string, subject: string, displayName?: string },
 *  expectedPubkey: string,
 *  signerPubkey: string,
 *  lastError: string
 * }} Initial state.
 */
export function createInitialIdentityLinkState() {
  return {
    status: IdentityLinkStatus.IDLE,
    identity: null,
    expectedPubkey: "",
    signerPubkey: "",
    lastError: ""
  };
}