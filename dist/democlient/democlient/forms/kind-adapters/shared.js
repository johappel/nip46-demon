/**
 * @typedef {object} BuildEventContext
 * @property {object} schema - Normalized form schema.
 * @property {Record<string,string>} values - Collected form values.
 * @property {string} pubkey - Active pubkey.
 */

/**
 * Checks whether a value is a plain object.
 * @param {unknown} value - Candidate value.
 * @returns {boolean} True when value is a plain object.
 */
export function isPlainObject(value) {
    return Object.prototype.toString.call(value) === "[object Object]";
}

/**
 * Converts a date/time string to unix seconds.
 * @param {string} value - Date/time input.
 * @returns {number|undefined} Unix timestamp or undefined.
 */
export function toUnixSeconds(value) {
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
export function resolveBaseKind(schema) {
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
export function resolveKindWithSelector(schema, values) {
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
export function normalizeTagValue(value) {
    return String(value === undefined || value === null ? "" : value).trim();
}

/**
 * Adds one tag only when value is present.
 * @param {string[][]} tags - Mutable tag array.
 * @param {string} tagName - Tag name.
 * @param {unknown} tagValue - Tag value.
 */
export function pushOptionalTag(tags, tagName, tagValue) {
    const value = normalizeTagValue(tagValue);
    if (!value) return;
    tags.push([tagName, value]);
}

/**
 * Builds tag array from schema tag mappings.
 * @param {object} schema - Form schema.
 * @param {Record<string,string>} values - Collected values.
 * @returns {string[][]} Tag list.
 */
export function buildTagsFromMappings(schema, values) {
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
export function parseTagsJson(values) {
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