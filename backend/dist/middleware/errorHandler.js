"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const logging_middleware_1 = require("@app/logging-middleware");
function errorHandler(err, _req, res, _next) {
    const status = err?.status ?? 500;
    const message = err?.message ?? "Internal Server Error";
    (0, logging_middleware_1.Log)("backend", "error", "middleware", `error ${status} ${message}`);
    res.status(status).json({ error: message });
}
