import { pushOptionalTag, resolveKindWithSelector, toUnixSeconds } from "./shared.js";

const SECONDS_PER_DAY = 86400;
const MAX_D_TAG_RANGE_DAYS = 3660;

/**
 * Reads the first non-empty value from a candidate key list.
 * @param {Record<string,string>} values - Collected form values.
 * @param {string[]} candidateKeys - Candidate field names.
 * @returns {string} First non-empty value or empty string.
 */
function readFirstValue(values, candidateKeys) {
    for (const key of candidateKeys) {
        const text = String(values?.[key] || "").trim();
        if (text) return text;
    }
    return "";
}

/**
 * Parses an optional unix timestamp field from form values.
 * @param {Record<string,string>} values - Collected form values.
 * @param {string[]} candidateKeys - Candidate field names.
 * @returns {number|undefined} Unix timestamp in seconds or undefined.
 * @throws {Error} If value exists but cannot be parsed.
 */
function parseOptionalUnixField(values, candidateKeys) {
    const raw = readFirstValue(values, candidateKeys);
    if (!raw) return undefined;
    const unix = toUnixSeconds(raw);
    if (unix === undefined) {
        throw new Error(`Ungueltiger Zeitwert fuer Feld "${candidateKeys[0]}".`);
    }
    return unix;
}

/**
 * Resolves the NIP-52 addressable identifier (`d` tag).
 * @param {Record<string,string>} values - Collected form values.
 * @returns {string} Stable identifier.
 */
function resolveNip52Identifier(values) {
    const explicitIdentifier = readFirstValue(values, ["identifier", "slug"]);
    if (explicitIdentifier) return explicitIdentifier;

    const title = readFirstValue(values, ["title"]);
    if (title) return title;

    return `calendar-entry-${Math.floor(Date.now() / 1000)}`;
}

/**
 * Builds one day range (`D` tags) for NIP-52 time-based events.
 * @param {number} startUnix - Inclusive start timestamp (seconds).
 * @param {number|undefined} endUnix - Optional exclusive end timestamp (seconds).
 * @returns {number[]} Day-granularity unix day values.
 * @throws {Error} If `end` is not greater than `start` or span is too large.
 */
function buildDayGranularityRange(startUnix, endUnix) {
    if (endUnix !== undefined && endUnix <= startUnix) {
        throw new Error('NIP-52 kind 31923: "end" muss groesser als "start" sein.');
    }

    const startDay = Math.floor(startUnix / SECONDS_PER_DAY);
    const lastInclusiveDay = endUnix !== undefined
        ? Math.floor((endUnix - 1) / SECONDS_PER_DAY)
        : startDay;

    const spanDays = (lastInclusiveDay - startDay) + 1;
    if (spanDays > MAX_D_TAG_RANGE_DAYS) {
        throw new Error(`NIP-52 kind 31923: Zeitraum ist zu gross (${spanDays} Tage).`);
    }

    const out = [];
    for (let day = startDay; day <= lastInclusiveDay; day += 1) {
        out.push(day);
    }
    return out;
}

/**
 * Builds a NIP-52 calendar-related event.
 * For kind 31923 (time-based), required tags from NIP-52 are enforced.
 * @param {import("./shared.js").BuildEventContext} context - Build context.
 * @returns {object} Unsigned nostr event.
 */
export function buildNip52UnsignedEvent(context) {
    const schema = context.schema;
    const values = context.values;
    const kind = resolveKindWithSelector(schema, values);

    const title = readFirstValue(values, ["title"]);
    const summary = readFirstValue(values, ["summary"]);
    const description = readFirstValue(values, ["description", "content"]);
    const identifier = resolveNip52Identifier(values);
    const location = readFirstValue(values, ["location"]);
    const geohash = readFirstValue(values, ["geohash", "g"]);
    const image = readFirstValue(values, ["image"]);
    const calendarReference = readFirstValue(values, ["calendarReference", "a"]);
    const rsvpStatus = readFirstValue(values, ["rsvpStatus", "status"]);
    const startTzid = readFirstValue(values, ["startTzid", "start_tzid"]);
    const endTzid = readFirstValue(values, ["endTzid", "end_tzid"]);
    const startUnix = parseOptionalUnixField(values, ["start"]);
    const endUnix = parseOptionalUnixField(values, ["end"]);

    const tags = [];
    pushOptionalTag(tags, "d", identifier);
    pushOptionalTag(tags, "title", title);
    pushOptionalTag(tags, "summary", summary);
    pushOptionalTag(tags, "location", location);
    pushOptionalTag(tags, "g", geohash);
    pushOptionalTag(tags, "image", image);

    if (kind === 31923) {
        if (startUnix === undefined) {
            throw new Error('NIP-52 kind 31923: Feld "start" ist erforderlich.');
        }

        pushOptionalTag(tags, "start", String(startUnix));
        if (endUnix !== undefined) {
            pushOptionalTag(tags, "end", String(endUnix));
        }

        const dayRange = buildDayGranularityRange(startUnix, endUnix);
        for (const dayValue of dayRange) {
            tags.push(["D", String(dayValue)]);
        }

        pushOptionalTag(tags, "start_tzid", startTzid);
        pushOptionalTag(tags, "end_tzid", endTzid);
    } else {
        if (startUnix !== undefined) {
            pushOptionalTag(tags, "start", String(startUnix));
        }
        if (endUnix !== undefined) {
            pushOptionalTag(tags, "end", String(endUnix));
        }
    }

    if (kind === 31925) {
        // RSVP entries should point to a calendar/event reference when available.
        pushOptionalTag(tags, "a", calendarReference);
        pushOptionalTag(tags, "status", rsvpStatus);
    }

    return {
        kind,
        created_at: Math.floor(Date.now() / 1000),
        tags,
        content: description,
        pubkey: context.pubkey
    };
}

