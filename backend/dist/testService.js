"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shortener_1 = require("./services/shortener");
async function run() {
    const origin = "http://localhost:8080";
    const results = [];
    try {
        // 1) Create with custom shortcode
        const { shortLink, short } = await shortener_1.shortenerService.create({ url: "https://example.com/long/page", validity: 30, shortcode: "abcd1" }, origin);
        results.push(`CREATE custom -> ${shortLink} (expires ${short.expiresAt})`);
        // 2) Stats before click
        let s1 = await shortener_1.shortenerService.stats("abcd1");
        results.push(`STATS before: clicks=${s1.totalClicks}`);
        // 3) Simulate redirect (records click)
        await shortener_1.shortenerService.resolveAndRecord("abcd1", "http://referrer.com/page", "192.168.1.10");
        let s2 = await shortener_1.shortenerService.stats("abcd1");
        results.push(`STATS after: clicks=${s2.totalClicks}, last=${s2.clicks[s2.clicks.length - 1]?.source}/${s2.clicks[s2.clicks.length - 1]?.location}`);
        // 4) Collision check
        try {
            await shortener_1.shortenerService.create({ url: "https://example.com", shortcode: "abcd1" }, origin);
            results.push("COLLISION: unexpected success");
        }
        catch (e) {
            results.push(`COLLISION: expected error status=${e.status}`);
        }
        // 5) Invalid URL
        try {
            await shortener_1.shortenerService.create({ url: "notaurl" }, origin);
            results.push("INVALID URL: unexpected success");
        }
        catch (e) {
            results.push(`INVALID URL: expected error status=${e.status}`);
        }
        // 6) Auto-generate
        const auto = await shortener_1.shortenerService.create({ url: "https://example.org/" }, origin);
        results.push(`CREATE auto -> ${auto.shortLink}`);
        console.log(results.join("\n"));
        process.exit(0);
    }
    catch (err) {
        console.error("Test failed:", err);
        process.exit(1);
    }
}
run();
