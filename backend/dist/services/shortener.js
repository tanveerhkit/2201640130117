"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shortenerService = exports.ShortenerService = void 0;
const memoryStore_1 = require("../store/memoryStore");
const shortcode_1 = require("../utils/shortcode");
const logging_middleware_1 = require("@app/logging-middleware");
function computeExpiry(validityMinutes) {
    const minutes = typeof validityMinutes === "number" && validityMinutes > 0 ? validityMinutes : 30;
    const expires = new Date(Date.now() + minutes * 60 * 1000);
    return expires.toISOString();
}
class ShortenerService {
    async create(data, origin) {
        const { url, validity, shortcode } = data;
        if (!url || !(0, shortcode_1.isValidURL)(url)) {
            await (0, logging_middleware_1.Log)("backend", "warn", "service", "create invalid url");
            throw Object.assign(new Error("Invalid URL"), { status: 400 });
        }
        let code;
        if (shortcode) {
            if (!(0, shortcode_1.isValidShortcode)(shortcode)) {
                await (0, logging_middleware_1.Log)("backend", "warn", "service", "invalid shortcode format");
                throw Object.assign(new Error("Invalid shortcode. Use 4-20 alphanumeric."), { status: 400 });
            }
            if (memoryStore_1.store.has(shortcode)) {
                await (0, logging_middleware_1.Log)("backend", "info", "service", "shortcode collision");
                throw Object.assign(new Error("Shortcode already in use"), { status: 409 });
            }
            code = shortcode;
        }
        else {
            // Generate until unique
            let attempt = 0;
            do {
                code = (0, shortcode_1.generateShortcode)();
                attempt++;
            } while (memoryStore_1.store.has(code) && attempt < 5);
            if (memoryStore_1.store.has(code)) {
                await (0, logging_middleware_1.Log)("backend", "error", "service", "failed to generate unique shortcode");
                throw Object.assign(new Error("Could not generate unique shortcode"), { status: 500 });
            }
        }
        const now = new Date().toISOString();
        const expiresAt = computeExpiry(validity);
        const record = {
            shortcode: code,
            url,
            createdAt: now,
            expiresAt,
            clicks: [],
        };
        memoryStore_1.store.save(record);
        await (0, logging_middleware_1.Log)("backend", "info", "service", `created shortcode ${code}`);
        const short = { shortcode: code, url, createdAt: now, expiresAt };
        const shortLink = `${origin}/${code}`;
        return { short, shortLink };
    }
    async stats(code) {
        const rec = memoryStore_1.store.get(code);
        if (!rec) {
            await (0, logging_middleware_1.Log)("backend", "warn", "service", "stats not found");
            throw Object.assign(new Error("Shortcode not found"), { status: 404 });
        }
        const clicks = rec.clicks.map(({ ip, ...rest }) => rest);
        return {
            shortcode: rec.shortcode,
            url: rec.url,
            createdAt: rec.createdAt,
            expiresAt: rec.expiresAt,
            totalClicks: rec.clicks.length,
            clicks,
        };
    }
    async resolveAndRecord(code, referrer, ip) {
        const rec = memoryStore_1.store.get(code);
        if (!rec) {
            await (0, logging_middleware_1.Log)("backend", "warn", "service", "redirect not found");
            throw Object.assign(new Error("Shortcode not found"), { status: 404 });
        }
        const now = new Date();
        const expired = now > new Date(rec.expiresAt);
        if (expired) {
            await (0, logging_middleware_1.Log)("backend", "info", "service", "redirect expired");
            throw Object.assign(new Error("Link expired"), { status: 410 });
        }
        const source = referrer ? safeHostname(referrer) : "direct";
        const location = coarseLocation(ip);
        const click = {
            timestamp: now.toISOString(),
            source,
            location,
            ip,
        };
        rec.clicks.push(click);
        await (0, logging_middleware_1.Log)("backend", "debug", "service", `click recorded ${code}`);
        return rec.url;
    }
}
exports.ShortenerService = ShortenerService;
function safeHostname(referrer) {
    try {
        const u = new URL(referrer);
        return u.hostname;
    }
    catch {
        return "unknown";
    }
}
function coarseLocation(ip) {
    // Coarse classification without external geo dependency
    if (!ip)
        return "unknown";
    if (ip.startsWith("10."))
        return "private-10.x";
    if (ip.startsWith("192.168."))
        return "private-192.168.x";
    if (ip.startsWith("172.")) {
        const s = ip.split(".");
        const second = Number(s[1]);
        if (second >= 16 && second <= 31)
            return "private-172.16-31.x";
    }
    return "public";
}
exports.shortenerService = new ShortenerService();
