/**
 * @typedef {object} BuildEventContext
 * @property {object} schema - Normalized form schema.
 * @property {Record<string,string>} values - Collected form values.
 * @property {string} pubkey - Active pubkey.
 */

const kindAdapterRegistry = new Map();

/**
 * Checks whether a value is a plain object.
 * @param {unknown} value - Candidate value.
 * @returns {boolean} True when value is a plain object.
 */
function isPlainObject(value) {
    return Object.prototype.toString.call(value) === "[object Object]";
}

/**
 * Converts a date/time string to unix seconds.
 * @param {string} value - Date/time input.
 * @returns {number|undefined} Unix timestamp or undefined.
 */
function toUnixSeconds(value) {
    const text = String(value || "").trim();
    if (!text) return undefined;
    const millis = Date.parse(text);
    if (!Number.isFinite(millis)) return undefined;
    return Math.floor(millis / 1000);
}

/**
 * Resolves base kind from schema.
 * @param {object} schema - Schema object.
 * @returns {number} Base event kind.
 */
function resolveBaseKind(schema) {
    const numericKind = Number(schema?.kind);
    if (!Number.isFinite(numericKind)) return 1;
    return Math.floor(numericKind);
}

/**
 * Resolves kind override from kind-selector fields.
 * @param {object} schema - Schema object.
 * @param {Record<string,string>} values - Collected values.
 * @returns {number} Resolved event kind.
 */
function resolveKindWithSelector(schema, values) {
    const baseKind = resolveBaseKind(schema);
    const selectorField = String(schema?.kindSelectorField || "").trim();
    if (!selectorField) return baseKind;

    const selectorValue = String(values?.[selectorField] || "").trim();
    if (!selectorValue) return baseKind;

    const selectorMap = isPlainObject(schema?.kindSelectorMap) ? schema.kindSelectorMap : {};
    const selectedKind = Number(selectorMap[selectorValue]);
    if (!Number.isFinite(selectedKind)) return baseKind;

    return Math.floor(selectedKind);
}

/**
 * Normalizes tag value.
 * @param {unknown} value - Raw tag value.
 * @returns {string} Normalized tag value.
 */
function normalizeTagValue(value) {
    return String(value === undefined || value === null ? "" : value).trim();
}

/**
 * Builds tag array from schema tag mappings.
 * @param {object} schema - Form schema.
 * @param {Record<string,string>} values - Collected values.
 * @returns {string[][]} Tag list.
 */
function buildTagsFromMappings(schema, values) {
    const out = [];
    for (const mapping of schema?.tagMappings || []) {
        const value = normalizeTagValue(values?.[mapping.field]);
        if (!value) continue;
        out.push([mapping.tag, value]);
    }
    return out;
}

/**
 * Parses optional tags JSON from a form value.
 * @param {Record<string,string>} values - Collected values.
 * @returns {string[][]} Parsed tags.
 */
function parseTagsJson(values) {
    const raw = String(values?.tagsJson || "").trim();
    if (!raw) return [];

    try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];

        return parsed
            .filter((tag) => Array.isArray(tag) && tag.length > 0)
            .map((tag) => tag.map((entry) => String(entry)));
    } catch (_err) {
        return [];
    }
}

/**
 * Builds a generic unsigned event from schema and values.
 * @param {BuildEventContext} context - Build context.
 * @returns {object} Unsigned nostr event.
 */
function buildGenericUnsignedEvent(context) {
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

/**
 * Builds a kind:1 text note event.
 * @param {BuildEventContext} context - Build context.
 * @returns {object} Unsigned nostr event.
 */
function buildKind1UnsignedEvent(context) {
    const content = String(context.values?.content || "").trim();
    return {
        kind: 1,
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
        content,
        pubkey: context.pubkey
    };
}

/**
 * Builds a kind:30023 long-form event.
 * @param {BuildEventContext} context - Build context.
 * @returns {object} Unsigned nostr event.
 */
function buildKind30023UnsignedEvent(context) {
    const values = context.values;
    const identifier = String(values.identifier || values.slug || values.title || "entry").trim();
    const title = String(values.title || "").trim();
    const summary = String(values.summary || "").trim();
    const image = String(values.image || "").trim();
    const publishedAt = toUnixSeconds(values.publishedAt || "");

    const tags = [["d", identifier]];
    if (title) tags.push(["title", title]);
    if (summary) tags.push(["summary", summary]);
    if (image) tags.push(["image", image]);
    if (publishedAt) tags.push(["published_at", String(publishedAt)]);

    return {
        kind: 30023,
        created_at: Math.floor(Date.now() / 1000),
        tags,
        content: String(values.content || "").trim(),
        pubkey: context.pubkey
    };
}

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
registerKindAdapter("kind-30023", buildKind30023UnsignedEvent);

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