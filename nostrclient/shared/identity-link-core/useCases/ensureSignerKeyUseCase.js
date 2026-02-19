import { IdentityLinkStatus } from "../state.js";

/**
 * Checks whether a string is a 64-char hex pubkey.
 * @param {string} value Candidate pubkey.
 * @returns {boolean} True when value is valid pubkey hex.
 */
function isPubkeyHex(value) {
  return /^[0-9a-f]{64}$/i.test(String(value || "").trim());
}

/**
 * Ensures a signer key for the given identity.
 * Uses compare-first: read active signer key first, fallback to ensure only when needed.
 * @param {{ signerBridgePort: { ensureUserKey: Function, getSignerStatus: Function } }} deps Dependencies.
 * @param {{ provider: string, subject: string, displayName?: string }} identity Identity payload.
 * @returns {Promise<{ status: string, signerPubkey: string, signerNpub: string, keyId: string }>} Use-case result.
 */
export async function ensureSignerKeyUseCase(deps, identity) {
  const signerStatus = await deps.signerBridgePort.getSignerStatus();
  const activePubkey = String(signerStatus?.activePubkey || "").trim().toLowerCase();
  if (isPubkeyHex(activePubkey)) {
    return {
      status: IdentityLinkStatus.LOADING,
      signerPubkey: activePubkey,
      signerNpub: String(signerStatus?.activeNpub || "").trim(),
      keyId: String(signerStatus?.activeKeyId || "").trim()
    };
  }

  const keyResult = await deps.signerBridgePort.ensureUserKey({
    provider: identity.provider,
    subject: identity.subject,
    displayName: identity.displayName || ""
  });

  return {
    status: IdentityLinkStatus.LOADING,
    signerPubkey: keyResult.pubkey || "",
    signerNpub: keyResult.npub || "",
    keyId: keyResult.keyId || ""
  };
}