"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingClient = void 0;
const cross_fetch_1 = __importDefault(require("cross-fetch"));
class LoggingClient {
    constructor(cfg = {}) {
        var _a, _b, _c;
        this.baseURL = ((_a = cfg.baseURL) !== null && _a !== void 0 ? _a : "http://20.244.56.144").replace(/\/$/, "");
        this.logPath = (_b = cfg.logPath) !== null && _b !== void 0 ? _b : "/evaluation-service/logs";
        this.authPath = (_c = cfg.authPath) !== null && _c !== void 0 ? _c : "/evaluation-service/auth";
        this.accessToken = cfg.accessToken;
        if (!cfg.accessToken) {
            // Allow backend to supply credentials for token fetch.
            const { email, name, rollNo, accessCode, clientID, clientSecret } = cfg;
            if (email && name && rollNo && accessCode && clientID && clientSecret) {
                this.creds = { email, name, rollNo, accessCode, clientID, clientSecret };
            }
        }
    }
    isTokenValid() {
        if (!this.accessToken || !this.tokenExpiry)
            return false;
        const now = Math.floor(Date.now() / 1000);
        // Refresh 60s early
        return now < this.tokenExpiry - 60;
    }
    async ensureToken() {
        if (this.isTokenValid())
            return this.accessToken;
        if (!this.creds)
            return this.accessToken; // frontend mode: use provided token as-is
        const url = `${this.baseURL}${this.authPath}`;
        const res = await (0, cross_fetch_1.default)(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(this.creds),
        });
        if (!res.ok) {
            // Do not throw to avoid breaking apps; swallow but return undefined
            return this.accessToken;
        }
        const data = (await res.json());
        this.accessToken = data.access_token;
        this.tokenExpiry = data.expires_in;
        return this.accessToken;
    }
    async log(input) {
        try {
            await this.ensureToken();
            const url = `${this.baseURL}${this.logPath}`;
            const headers = { "Content-Type": "application/json" };
            if (this.accessToken)
                headers["Authorization"] = `Bearer ${this.accessToken}`;
            const res = await (0, cross_fetch_1.default)(url, {
                method: "POST",
                headers,
                body: JSON.stringify(input),
            });
            // Avoid throwing; the consumer shouldn't break from logging failures.
            // If needed, response could be inspected by callers later via a callback.
            void res; // no-op
        }
        catch {
            // Swallow errors to keep middleware safe and non-disruptive.
        }
    }
}
exports.LoggingClient = LoggingClient;
