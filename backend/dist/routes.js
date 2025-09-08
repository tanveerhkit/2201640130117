"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const shortener_1 = require("./services/shortener");
const logging_middleware_1 = require("@app/logging-middleware");
const router = (0, express_1.Router)();
router.post("/shorturls", async (req, res, next) => {
    try {
        const origin = deriveOrigin(req);
        const { short, shortLink } = await shortener_1.shortenerService.create(req.body, origin);
        await (0, logging_middleware_1.Log)("backend", "info", "handler", `created ${short.shortcode}`);
        res.status(201).json({ shortLink, expiry: short.expiresAt });
    }
    catch (err) {
        next(err);
    }
});
router.get("/shorturls/:code", async (req, res, next) => {
    try {
        const code = req.params.code;
        const stats = await shortener_1.shortenerService.stats(code);
        await (0, logging_middleware_1.Log)("backend", "debug", "handler", `stats ${code}`);
        res.json(stats);
    }
    catch (err) {
        next(err);
    }
});
router.get("/:code", async (req, res, next) => {
    try {
        const code = req.params.code;
        const ip = getIp(req);
        const referrer = req.get("referer") || req.get("referrer") || undefined;
        const url = await shortener_1.shortenerService.resolveAndRecord(code, referrer, ip);
        await (0, logging_middleware_1.Log)("backend", "info", "handler", `redirect ${code}`);
        res.redirect(302, url);
    }
    catch (err) {
        next(err);
    }
});
function deriveOrigin(req) {
    const protocol = req.headers["x-forwarded-proto"] || req.protocol || "http";
    const host = req.get("host") || "localhost";
    return `${protocol}://${host}`;
}
function getIp(req) {
    const xfwd = req.headers["x-forwarded-for"] || "";
    const first = xfwd.split(",")[0].trim();
    return first || (req.socket?.remoteAddress ?? "");
}
exports.default = router;
