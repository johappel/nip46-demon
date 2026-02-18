import { validateAdapterBundle } from "../adapter-contracts/index.js";
import { createInitialIdentityLinkState } from "./state.js";
import { compareKeysUseCase } from "./useCases/compareKeysUseCase.js";
import { ensureSignerKeyUseCase } from "./useCases/ensureSignerKeyUseCase.js";
import { loadIdentityUseCase } from "./useCases/loadIdentityUseCase.js";

/**
 * Runs a full identity-link synchronization cycle.
 * @param {unknown} adapterBundle Adapter bundle candidate.
 * @returns {Promise<object>} Final cycle state.
 */
export async function runIdentityLinkSync(adapterBundle) {
  const state = createInitialIdentityLinkState();
  const adapters = validateAdapterBundle(adapterBundle);

  const identityResult = await loadIdentityUseCase({
    identityStrategy: adapters.identityStrategy
  });

  state.identity = identityResult.identity;
  state.expectedPubkey = identityResult.expectedPubkey;

  const signerResult = await ensureSignerKeyUseCase(
    { signerBridgePort: adapters.signerBridgePort },
    identityResult.identity
  );

  state.signerPubkey = signerResult.signerPubkey;
  const compareResult = compareKeysUseCase(state.expectedPubkey, state.signerPubkey);
  state.status = compareResult.status;
  state.lastError = compareResult.reason === "pubkey_mismatch" ? "" : "";

  return {
    ...state,
    signerNpub: signerResult.signerNpub,
    keyId: signerResult.keyId,
    reason: compareResult.reason
  };
}