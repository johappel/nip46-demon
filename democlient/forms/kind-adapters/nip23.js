import { parseTagsJson, pushOptionalTag, resolveKindWithSelector, toUnixSeconds } from "./shared.js";

/**
 * Reads the first non-empty value from candidate field names.
 * @param {Record<string,string>} values - Collected form values.
 * @param {string[]} candidateKeys - Candidate field keys.
 * @returns {string} First non-empty normalized value.
 */
function readFirstValue(values, candidateKeys) {
    for (const key of candidateKeys) {
        const value = String(values?.[key] || "").trim();
        if (value) return value;
    }
    return "";
}

/**
 * Parses one unix timestamp field.
 * Supports ISO date/time strings and unix second inputs.
 * @param {Record<string,string>} values - Collected form values.
 * @param {string[]} candidateKeys - Candidate field keys.
 * @returns {number|undefined} Unix timestamp in seconds.
 */
function parseUnixSecondsField(values, candidateKeys) {
    const raw = readFirstValue(values, candidateKeys);
    if (!raw) return undefined;

    if (/^\d{10}$/.test(raw)) return Number(raw);
    if (/^\d{13}$/.test(raw)) return Math.floor(Number(raw) / 1000);
    return toUnixSeconds(raw);
}

/**
 * Parses comma/newline separated topic list into `t` tags.
 * @param {Record<string,string>} values - Collected form values.
 * @returns {string[][]} Topic tags.
 */
function parseTopicTags(values) {
    const rawTopics = readFirstValue(values, ["topics"]);
    if (!rawTopics) return [];

    const seen = new Set();
    const tags = [];
    const parts = rawTopics
        .split(/[\n,]/g)
        .map((entry) => String(entry || "").trim())
        .filter(Boolean);

    for (const topic of parts) {
        const normalized = topic.toLowerCase();
        if (seen.has(normalized)) continue;
        seen.add(normalized);
        tags.push(["t", topic]);
    }

    return tags;
}

/**
 * Builds a NIP-23 long-form event (publish/draft).
 * @param {import("./shared.js").BuildEventContext} context - Build context.
 * @returns {object} Unsigned nostr event.
 */
export function buildNip23UnsignedEvent(context) {
    const schema = context.schema;
    const values = context.values;
    const identifier = readFirstValue(values, ["identifier", "slug", "title"]) || "entry";
    const title = readFirstValue(values, ["title"]);
    const summary = readFirstValue(values, ["summary"]);
    const image = readFirstValue(values, ["image"]);
    const content = readFirstValue(values, ["content", "description"]);
    const publishedAt = parseUnixSecondsField(values, ["published_at", "publishedAt"]);

    const tags = [];
    pushOptionalTag(tags, "d", identifier);
    pushOptionalTag(tags, "title", title);
    pushOptionalTag(tags, "summary", summary);
    pushOptionalTag(tags, "image", image);
    if (publishedAt) {
        pushOptionalTag(tags, "published_at", String(publishedAt));
    }
    tags.push(...parseTopicTags(values));
    tags.push(...parseTagsJson(values));

    return {
        kind: resolveKindWithSelector(schema, values),
        created_at: Math.floor(Date.now() / 1000),
        tags,
        content,
        pubkey: context.pubkey
    };
}

