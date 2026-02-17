const DEFAULT_FORM_SCHEMA_RELATIVE_URI = "./schemas/kind1.json";
const SUPPORTED_FORM_SCHEMA_VERSION = "nostr-form-v1";

/**
 * Checks whether a value is a plain object.
 * @param {unknown} value - Candidate value.
 * @returns {boolean} True when value is a plain object.
 */
function isPlainObject(value) {
    return Object.prototype.toString.call(value) === "[object Object]";
}

/**
 * Converts a value to a positive integer.
 * @param {unknown} value - Candidate value.
 * @returns {number|undefined} Positive integer or undefined.
 */
function toPositiveInteger(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return undefined;
    const rounded = Math.floor(numeric);
    if (rounded <= 0) return undefined;
    return rounded;
}

/**
 * Normalizes select options.
 * @param {unknown} value - Raw options value.
 * @returns {{label:string,value:string}[]} Normalized options.
 */
function normalizeSelectOptions(value) {
    if (!Array.isArray(value)) return [];
    return value
        .map((option, index) => {
            if (isPlainObject(option)) {
                const label = String(option.label ?? option.value ?? `Option ${index + 1}`).trim();
                const optionValue = String(option.value ?? option.label ?? "").trim();
                if (!label || !optionValue) return null;
                return { label, value: optionValue };
            }

            const text = String(option || "").trim();
            if (!text) return null;
            return { label: text, value: text };
        })
        .filter(Boolean);
}

/**
 * Normalizes one field definition.
 * @param {unknown} value - Raw field definition.
 * @param {number} index - Field index.
 * @returns {object} Normalized field.
 */
function normalizeFieldSchema(value, index) {
    const fallbackName = `field_${index + 1}`;
    const raw = isPlainObject(value) ? value : {};

    const allowedTypes = new Set(["text", "textarea", "number", "url", "date", "datetime-local", "select", "hidden"]);
    const requestedType = String(raw.type || "text").trim().toLowerCase();
    const type = allowedTypes.has(requestedType) ? requestedType : "text";

    const name = String(raw.name || fallbackName).trim() || fallbackName;
    const label = String(raw.label || name).trim() || name;

    return {
        name,
        label,
        type,
        required: Boolean(raw.required),
        placeholder: String(raw.placeholder || "").trim(),
        defaultValue: raw.defaultValue === undefined || raw.defaultValue === null ? "" : String(raw.defaultValue),
        maxLength: toPositiveInteger(raw.maxLength),
        min: raw.min === undefined || raw.min === null ? undefined : Number(raw.min),
        max: raw.max === undefined || raw.max === null ? undefined : Number(raw.max),
        step: raw.step === undefined || raw.step === null ? undefined : String(raw.step),
        rows: toPositiveInteger(raw.rows),
        options: normalizeSelectOptions(raw.options)
    };
}

/**
 * Normalizes tag mapping configuration.
 * @param {unknown} value - Raw mappings.
 * @returns {{field:string,tag:string}[]} Normalized mappings.
 */
function normalizeTagMappings(value) {
    if (!Array.isArray(value)) return [];
    return value
        .map((mapping) => {
            if (!isPlainObject(mapping)) return null;
            const field = String(mapping.field || "").trim();
            const tag = String(mapping.tag || "").trim();
            if (!field || !tag) return null;
            return { field, tag };
        })
        .filter(Boolean);
}

/**
 * Normalizes kind selector map configuration.
 * @param {unknown} value - Raw selector map.
 * @returns {Record<string, number>} Normalized selector map.
 */
function normalizeKindSelectorMap(value) {
    if (!isPlainObject(value)) return {};
    const out = {};
    for (const [key, rawKind] of Object.entries(value)) {
        const numericKind = Number(rawKind);
        if (!Number.isFinite(numericKind)) continue;
        out[String(key)] = Math.floor(numericKind);
    }
    return out;
}

/**
 * Normalizes one form schema.
 * @param {unknown} value - Raw schema value.
 * @returns {object} Normalized schema.
 */
export function normalizeFormSchema(value) {
    const raw = isPlainObject(value) ? value : {};

    const rawFields = Array.isArray(raw.fields) ? raw.fields : [];
    const fields = rawFields.map((field, index) => normalizeFieldSchema(field, index));
    if (fields.length === 0) {
        fields.push(normalizeFieldSchema({ name: "content", label: "Content", type: "textarea", required: true }, 0));
    }

    const version = String(raw.version || SUPPORTED_FORM_SCHEMA_VERSION).trim() || SUPPORTED_FORM_SCHEMA_VERSION;
    const kind = Number(raw.kind);

    return {
        version,
        id: String(raw.id || "custom-form").trim() || "custom-form",
        title: String(raw.title || "Nostr Event").trim() || "Nostr Event",
        description: String(raw.description || "").trim(),
        kind: Number.isFinite(kind) ? Math.floor(kind) : 1,
        adapter: String(raw.adapter || "").trim(),
        submitLabel: String(raw.submitLabel || "Signieren + senden").trim() || "Signieren + senden",
        contentField: String(raw.contentField || "content").trim() || "content",
        kindSelectorField: String(raw.kindSelectorField || "").trim(),
        kindSelectorMap: normalizeKindSelectorMap(raw.kindSelectorMap),
        tagMappings: normalizeTagMappings(raw.tagMappings),
        fields
    };
}

/**
 * Fetches and parses schema JSON from URL.
 * @param {string} formUri - Schema URI.
 * @returns {Promise<unknown>} Parsed JSON payload.
 */
async function fetchSchemaJson(formUri) {
    const response = await fetch(formUri, {
        method: "GET",
        headers: { "accept": "application/json" }
    });

    if (!response.ok) {
        throw new Error(`Schema konnte nicht geladen werden (${response.status}).`);
    }

    return response.json();
}

/**
 * Builds default schema URI relative to this module.
 * @returns {string} Absolute schema URI.
 */
function getDefaultFormSchemaUri() {
    return new URL(DEFAULT_FORM_SCHEMA_RELATIVE_URI, import.meta.url).toString();
}

/**
 * Loads and normalizes one form schema.
 * Falls back to the bundled kind:1 schema when remote loading fails.
 * @param {{formUri?: string}=} options - Load options.
 * @returns {Promise<object>} Normalized schema.
 */
export async function loadFormSchema(options = {}) {
    const requestedUri = String(options.formUri || "").trim();

    if (requestedUri) {
        try {
            const requestedPayload = await fetchSchemaJson(requestedUri);
            return normalizeFormSchema(requestedPayload);
        } catch (_err) {
            // Continue with local fallback schema.
        }
    }

    const defaultPayload = await fetchSchemaJson(getDefaultFormSchemaUri());
    return normalizeFormSchema(defaultPayload);
}

/**
 * Checks whether a schema version is known by this runtime.
 * @param {object} schema - Normalized schema.
 * @returns {boolean} True when schema version is supported.
 */
export function isSupportedSchemaVersion(schema) {
    return String(schema?.version || "") === SUPPORTED_FORM_SCHEMA_VERSION;
}