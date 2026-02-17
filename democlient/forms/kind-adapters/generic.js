import { buildTagsFromMappings, parseTagsJson, resolveKindWithSelector, toUnixSeconds } from "./shared.js";

/**
 * Builds a generic unsigned event from schema and values.
 * @param {import("./shared.js").BuildEventContext} context - Build context.
 * @returns {object} Unsigned nostr event.
 */
export function buildGenericUnsignedEvent(context) {
    const schema = context.schema;
    const values = context.values;

    const contentFieldName = String(schema?.contentField || "content").trim() || "content";
    const content = String(values?.[contentFieldName] || "").trim();
    const tagsFromMappings = buildTagsFromMappings(schema, values);
    const tagsFromJson = parseTagsJson(values);

    const explicitCreatedAt = toUnixSeconds(values?.createdAt);

    return {
        kind: resolveKindWithSelector(schema, values),
        created_at: explicitCreatedAt || Math.floor(Date.now() / 1000),
        tags: [...tagsFromMappings, ...tagsFromJson],
        content,
        pubkey: context.pubkey
    };
}