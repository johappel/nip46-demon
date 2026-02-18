/**
 * Builds a kind:1 text note event.
 * @param {import("./shared.js").BuildEventContext} context - Build context.
 * @returns {object} Unsigned nostr event.
 */
export function buildKind1UnsignedEvent(context) {
    const content = String(context.values?.content || "").trim();
    return {
        kind: 1,
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
        content,
        pubkey: context.pubkey
    };
}