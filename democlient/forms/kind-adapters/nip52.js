import { pushOptionalTag, resolveKindWithSelector, toUnixSeconds } from "./shared.js";

const SECONDS_PER_DAY = 86400;
const MAX_D_TAG_RANGE_DAYS = 3660;
const GEOHASH_BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz";
const GEOHASH_DEFAULT_PRECISION = 9;

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
 * Resolves the browser/system IANA time zone id.
 * @returns {string} Time zone id or empty string.
 */
function getBrowserTimeZoneId() {
    try {
        const zone = Intl.DateTimeFormat().resolvedOptions()?.timeZone;
        return String(zone || "").trim();
    } catch (_err) {
        return "";
    }
}

/**
 * Parses a decimal coordinate.
 * @param {string} text - Raw coordinate text.
 * @returns {number|undefined} Parsed finite number.
 */
function parseCoordinate(text) {
    const numeric = Number(String(text || "").trim());
    if (!Number.isFinite(numeric)) return undefined;
    return numeric;
}

/**
 * Tries to parse coordinates from free-text location.
 * Accepted format example: "52.5200, 13.4050".
 * @param {string} locationText - Human readable location.
 * @returns {{lat:number, lon:number}|undefined} Parsed coordinates.
 */
function parseCoordinatesFromLocationText(locationText) {
    const raw = String(locationText || "");
    if (!raw) return undefined;

    const match = raw.match(/(-?\d+(?:\.\d+)?)\s*[,;]\s*(-?\d+(?:\.\d+)?)/);
    if (!match) return undefined;

    const lat = parseCoordinate(match[1]);
    const lon = parseCoordinate(match[2]);
    if (lat === undefined || lon === undefined) return undefined;
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return undefined;

    return { lat, lon };
}

/**
 * Resolves coordinates from explicit fields or location text.
 * @param {Record<string,string>} values - Collected form values.
 * @param {string} locationText - Human readable location.
 * @returns {{lat:number, lon:number}|undefined} Parsed coordinates.
 */
function resolveCoordinates(values, locationText) {
    const latRaw = readFirstValue(values, ["locationLat", "latitude", "lat"]);
    const lonRaw = readFirstValue(values, ["locationLon", "longitude", "lon", "lng"]);
    if (latRaw && lonRaw) {
        const lat = parseCoordinate(latRaw);
        const lon = parseCoordinate(lonRaw);
        if (lat !== undefined && lon !== undefined && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
            return { lat, lon };
        }
    }

    return parseCoordinatesFromLocationText(locationText);
}

/**
 * Encodes coordinates as geohash.
 * @param {number} lat - Latitude.
 * @param {number} lon - Longitude.
 * @param {number=} precision - Geohash length.
 * @returns {string} Geohash.
 */
function encodeGeohash(lat, lon, precision = GEOHASH_DEFAULT_PRECISION) {
    let minLat = -90;
    let maxLat = 90;
    let minLon = -180;
    let maxLon = 180;
    let bits = 0;
    let bitCount = 0;
    let useLon = true;
    let out = "";

    while (out.length < precision) {
        if (useLon) {
            const midLon = (minLon + maxLon) / 2;
            if (lon >= midLon) {
                bits = (bits << 1) | 1;
                minLon = midLon;
            } else {
                bits <<= 1;
                maxLon = midLon;
            }
        } else {
            const midLat = (minLat + maxLat) / 2;
            if (lat >= midLat) {
                bits = (bits << 1) | 1;
                minLat = midLat;
            } else {
                bits <<= 1;
                maxLat = midLat;
            }
        }

        useLon = !useLon;
        bitCount += 1;
        if (bitCount === 5) {
            out += GEOHASH_BASE32[bits];
            bits = 0;
            bitCount = 0;
        }
    }

    return out;
}

/**
 * Resolves geohash from explicit field or derived coordinates.
 * @param {Record<string,string>} values - Collected form values.
 * @param {string} locationText - Human readable location.
 * @returns {string} Geohash or empty string.
 */
function resolveGeohash(values, locationText) {
    const explicit = readFirstValue(values, ["geohash", "g"]);
    if (explicit) return explicit;

    const coords = resolveCoordinates(values, locationText);
    if (!coords) return "";
    return encodeGeohash(coords.lat, coords.lon);
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
    const geohash = resolveGeohash(values, location);
    const image = readFirstValue(values, ["image"]);
    const calendarReference = readFirstValue(values, ["calendarReference", "a"]);
    const rsvpStatus = readFirstValue(values, ["rsvpStatus", "status"]);
    const requestedStartTzid = readFirstValue(values, ["startTzid", "start_tzid"]);
    const requestedEndTzid = readFirstValue(values, ["endTzid", "end_tzid"]);
    const browserTzid = getBrowserTimeZoneId();
    const startTzid = requestedStartTzid || browserTzid;
    const endTzid = requestedEndTzid || startTzid;
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

