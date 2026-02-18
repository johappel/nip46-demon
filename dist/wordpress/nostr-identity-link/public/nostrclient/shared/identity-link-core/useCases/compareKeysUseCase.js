import { IdentityLinkStatus } from "../state.js";

/**
 * Compares expected and signer pubkeys and returns workflow status.
 * @param {string} expectedPubkey Pubkey stored by the backend.
 * @param {string} signerPubkey Pubkey reported by the signer.
 * @returns {{ status: string, reason: string }} Comparison result.
 */
export function compareKeysUseCase(expectedPubkey, signerPubkey) {
  const expected = (expectedPubkey || "").trim().toLowerCase();
  const actual = (signerPubkey || "").trim().toLowerCase();

  if (!actual) {
    return { status: IdentityLinkStatus.ERROR, reason: "missing_signer_pubkey" };
  }

  if (!expected) {
    return { status: IdentityLinkStatus.UNBOUND, reason: "missing_backend_binding" };
  }

  if (expected === actual) {
    return { status: IdentityLinkStatus.MATCHED, reason: "pubkey_match" };
  }

  return { status: IdentityLinkStatus.MISMATCHED, reason: "pubkey_mismatch" };
}