import { IdentityLinkStatus } from "../state.js";

/**
 * Loads provider identity through the configured strategy.
 * @param {{ identityStrategy: { getSessionIdentity: Function, normalizeSubject: Function } }} deps Dependencies.
 * @returns {Promise<{ status: string, identity: { provider: string, subject: string, displayName?: string }, expectedPubkey: string }>} Use-case result.
 */
export async function loadIdentityUseCase(deps) {
  const session = await deps.identityStrategy.getSessionIdentity();
  const normalizedSubject = deps.identityStrategy.normalizeSubject(session.subject);

  return {
    status: IdentityLinkStatus.LOADING,
    identity: {
      provider: session.provider,
      subject: normalizedSubject,
      displayName: session.displayName || ""
    },
    expectedPubkey: session.expectedPubkey || ""
  };
}