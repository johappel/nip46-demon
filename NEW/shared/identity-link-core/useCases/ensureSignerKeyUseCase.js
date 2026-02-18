import { IdentityLinkStatus } from "../state.js";

/**
 * Ensures a signer key for the given identity.
 * @param {{ signerBridgePort: { ensureUserKey: Function } }} deps Dependencies.
 * @param {{ provider: string, subject: string, displayName?: string }} identity Identity payload.
 * @returns {Promise<{ status: string, signerPubkey: string, signerNpub: string, keyId: string }>} Use-case result.
 */
export async function ensureSignerKeyUseCase(deps, identity) {
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