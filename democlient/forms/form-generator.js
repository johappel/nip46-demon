const TEXT_LIKE_TYPES = new Set(["text", "textarea", "url"]);

/**
 * Clears all children of an element.
 * @param {HTMLElement} element - Target element.
 */
function clearElementChildren(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

/**
 * Builds a stable input id for one field.
 * @param {string} formId - Form identifier.
 * @param {string} fieldName - Field name.
 * @returns {string} Stable DOM id.
 */
function buildFieldDomId(formId, fieldName) {
    const normalizedFormId = String(formId || "form").replace(/[^a-z0-9_-]/gi, "-");
    const normalizedFieldName = String(fieldName || "field").replace(/[^a-z0-9_-]/gi, "-");
    return `nostr-${normalizedFormId}-${normalizedFieldName}`;
}

/**
 * Creates one select option element.
 * @param {{label:string,value:string}} option - Option payload.
 * @returns {HTMLOptionElement} Option element.
 */
function createSelectOption(option) {
    const optionEl = document.createElement("option");
    optionEl.value = option.value;
    optionEl.textContent = option.label;
    return optionEl;
}

/**
 * Applies common field attributes.
 * @param {HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement} control - Target control.
 * @param {object} field - Field schema.
 */
function applyCommonFieldAttributes(control, field) {
    control.name = field.name;
    control.required = Boolean(field.required);

    if (typeof field.placeholder === "string" && field.placeholder) {
        control.placeholder = field.placeholder;
    }

    if (field.maxLength && "maxLength" in control) {
        control.maxLength = field.maxLength;
    }

    if (field.defaultValue !== undefined && field.defaultValue !== null && field.defaultValue !== "") {
        control.value = String(field.defaultValue);
    }

    if (typeof field.min === "number" && Number.isFinite(field.min) && "min" in control) {
        control.min = String(field.min);
    }

    if (typeof field.max === "number" && Number.isFinite(field.max) && "max" in control) {
        control.max = String(field.max);
    }

    if (typeof field.step === "string" && field.step && "step" in control) {
        control.step = field.step;
    }
}

/**
 * Creates one form control element from field schema.
 * @param {object} field - Field schema.
 * @returns {HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement} Rendered control.
 */
function createFieldControl(field) {
    if (field.type === "textarea") {
        const textarea = document.createElement("textarea");
        textarea.rows = field.rows || 5;
        applyCommonFieldAttributes(textarea, field);
        return textarea;
    }

    if (field.type === "select") {
        const select = document.createElement("select");
        applyCommonFieldAttributes(select, field);
        for (const option of field.options || []) {
            select.appendChild(createSelectOption(option));
        }
        return select;
    }

    const input = document.createElement("input");
    input.type = field.type === "hidden" ? "hidden" : field.type;
    applyCommonFieldAttributes(input, field);
    return input;
}

/**
 * Renders one field block into a container.
 * @param {HTMLElement} containerEl - Target container.
 * @param {object} schema - Form schema.
 * @param {object} field - Field schema.
 */
function renderField(containerEl, schema, field) {
    const wrapperEl = document.createElement("div");
    wrapperEl.className = "nostr-form-field";

    const control = createFieldControl(field);
    const domId = buildFieldDomId(schema.id, field.name);
    control.id = domId;
    control.dataset.nostrFieldName = field.name;

    if (field.type !== "hidden") {
        const labelEl = document.createElement("label");
        labelEl.setAttribute("for", domId);
        labelEl.textContent = field.label;
        wrapperEl.appendChild(labelEl);
    }

    wrapperEl.appendChild(control);
    containerEl.appendChild(wrapperEl);
}

/**
 * Renders full field list from schema.
 * @param {{containerEl: HTMLElement, schema: object}} options - Render options.
 */
export function renderFormSchema(options) {
    const containerEl = options?.containerEl;
    const schema = options?.schema;
    if (!(containerEl instanceof HTMLElement)) {
        throw new Error("renderFormSchema: containerEl fehlt.");
    }
    if (!schema || !Array.isArray(schema.fields)) {
        throw new Error("renderFormSchema: ungueltiges Schema.");
    }

    clearElementChildren(containerEl);
    for (const field of schema.fields) {
        renderField(containerEl, schema, field);
    }
}

/**
 * Escapes a value for CSS attribute selectors.
 * Falls back to a conservative escape when `CSS.escape` is unavailable.
 * @param {string} value - Raw selector value.
 * @returns {string} Escaped selector value.
 */
function escapeCssIdentifier(value) {
    if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
        return CSS.escape(value);
    }
    return String(value).replace(/["\\]/g, "\\$&");
}

/**
 * Resolves one form control by field name.
 * @param {HTMLFormElement} formEl - Form element.
 * @param {string} fieldName - Field name.
 * @returns {HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement|null} Matching control.
 */
function getFormControlByFieldName(formEl, fieldName) {
    const escapedName = escapeCssIdentifier(fieldName);
    const selector = `[name="${escapedName}"]`;
    const element = formEl.querySelector(selector);
    if (
        element instanceof HTMLInputElement ||
        element instanceof HTMLTextAreaElement ||
        element instanceof HTMLSelectElement
    ) {
        return element;
    }
    return null;
}

/**
 * Reads one control value.
 * @param {HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement} control - Control element.
 * @returns {string} Normalized control value.
 */
function readControlValue(control) {
    return String(control.value || "").trim();
}

/**
 * Collects normalized values from a form by schema fields.
 * @param {HTMLFormElement} formEl - Source form.
 * @param {object} schema - Form schema.
 * @returns {Record<string,string>} Collected values.
 */
export function collectFormValues(formEl, schema) {
    const values = {};
    for (const field of schema.fields || []) {
        const control = getFormControlByFieldName(formEl, field.name);
        values[field.name] = control ? readControlValue(control) : "";
    }
    return values;
}

/**
 * Validates collected form values against schema.
 * @param {object} schema - Form schema.
 * @param {Record<string,string>} values - Collected form values.
 * @returns {{ok:boolean,message:string}} Validation result.
 */
export function validateFormValues(schema, values) {
    for (const field of schema.fields || []) {
        const value = String(values[field.name] || "");

        if (field.required && !value.trim()) {
            return { ok: false, message: `Bitte Feld "${field.label}" ausfuellen.` };
        }

        if (field.maxLength && value.length > field.maxLength) {
            return { ok: false, message: `Feld "${field.label}" darf maximal ${field.maxLength} Zeichen enthalten.` };
        }

        if (field.type === "number" && value) {
            const numeric = Number(value);
            if (!Number.isFinite(numeric)) {
                return { ok: false, message: `Feld "${field.label}" erwartet eine Zahl.` };
            }
        }
    }

    return { ok: true, message: "" };
}

/**
 * Binds one live character counter to the first text-like field with maxLength.
 * @param {{formEl: HTMLFormElement, schema: object, counterEl: HTMLElement|null}} options - Counter options.
 * @returns {() => void} Cleanup function.
 */
export function bindCharacterCounter(options) {
    const formEl = options?.formEl;
    const schema = options?.schema;
    const counterEl = options?.counterEl || null;

    if (!(formEl instanceof HTMLFormElement) || !(counterEl instanceof HTMLElement)) {
        return () => {};
    }

    const counterField = (schema?.fields || []).find((field) => field.maxLength && TEXT_LIKE_TYPES.has(field.type));
    if (!counterField) {
        counterEl.textContent = "";
        return () => {};
    }

    const control = getFormControlByFieldName(formEl, counterField.name);
    if (!control) {
        counterEl.textContent = "";
        return () => {};
    }

    /**
     * Updates visible counter state.
     */
    function updateCounter() {
        const len = String(control.value || "").length;
        counterEl.textContent = `${len} / ${counterField.maxLength}`;
    }

    control.addEventListener("input", updateCounter);
    updateCounter();

    return () => {
        control.removeEventListener("input", updateCounter);
    };
}
