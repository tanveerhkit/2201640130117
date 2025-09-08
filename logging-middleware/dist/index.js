"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initLogger = initLogger;
exports.Log = Log;
exports.expressLogger = expressLogger;
const client_1 = require("./client");
let defaultClient = null;
function initLogger(cfg) {
    defaultClient = new client_1.LoggingClient(cfg);
    return defaultClient;
}
async function Log(stack, level, pkg, message) {
    if (!defaultClient) {
        defaultClient = new client_1.LoggingClient();
    }
    const payload = { stack, level, package: pkg, message };
    await defaultClient.log(payload);
}
// Express request logging middleware (optional convenience)
// Logs request start and completion with status and duration.
function expressLogger(opts) {
    var _a, _b;
    const stack = (_a = opts === null || opts === void 0 ? void 0 : opts.stack) !== null && _a !== void 0 ? _a : "backend";
    const pkg = (_b = opts === null || opts === void 0 ? void 0 : opts.pkg) !== null && _b !== void 0 ? _b : "middleware";
    return function (req, res, next) {
        const start = Date.now();
        const method = req.method;
        const path = req.originalUrl || req.url;
        Log(stack, "info", pkg, `req start ${method} ${path}`);
        res.on("finish", () => {
            const ms = Date.now() - start;
            Log(stack, "info", pkg, `req done ${method} ${path} ${res.statusCode} ${ms}ms`);
        });
        next();
    };
}
