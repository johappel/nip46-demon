import { buildGenericUnsignedEvent } from "./generic.js";
import { buildKind1UnsignedEvent } from "./kind1.js";
import { buildNip23UnsignedEvent } from "./nip23.js";
import { buildNip52UnsignedEvent } from "./nip52.js";

/**
 * @typedef {import("./shared.js").BuildEventContext} BuildEventContext
 */

const kindAdapterRegistry = new Map();

/**
 * Registers one custom kind adapter.
 * @param {string} adapterId - Adapter id.
 * @param {(context: BuildEventContext) => object} builder - Adapter builder function.
 */
export function registerKindAdapter(adapterId, builder) {
    const id = String(adapterId || "").trim();
    if (!id) return;
    if (typeof builder !== "function") return;
    kindAdapterRegistry.set(id, builder);
}

/**
 * Resolves adapter id from schema.
 * @param {object} schema - Form schema.
 * @returns {string} Adapter id.
 */
function resolveAdapterId(schema) {
    const explicit = String(schema?.adapter || "").trim();
    if (explicit) return explicit;

    if (Number(schema?.kind) === 1) return "kind-1";
    if (Number(schema?.kind) === 30023) return "kind-30023";
    return "generic-kind";
}

registerKindAdapter("generic-kind", buildGenericUnsignedEvent);
registerKindAdapter("kind-1", buildKind1UnsignedEvent);
registerKindAdapter("kind-30023", buildNip23UnsignedEvent);
registerKindAdapter("nip-52", buildNip52UnsignedEvent);

/**
 * Builds an unsigned event using the resolved adapter.
 * @param {BuildEventContext} context - Build context.
 * @returns {object} Unsigned nostr event.
 */
export function buildUnsignedEventFromForm(context) {
    const adapterId = resolveAdapterId(context?.schema);
    const builder = kindAdapterRegistry.get(adapterId) || kindAdapterRegistry.get("generic-kind");
    return builder(context);
}