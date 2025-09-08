"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const logging_middleware_1 = require("@app/logging-middleware");
const app_1 = require("./app");
// Initialize logger with either access token (frontend-safe) or backend creds for auto auth.
(0, logging_middleware_1.initLogger)({
    baseURL: process.env.EVAL_BASE_URL || "http://20.244.56.144",
    accessToken: process.env.EVAL_ACCESS_TOKEN,
    email: process.env.EVAL_EMAIL,
    name: process.env.EVAL_NAME,
    rollNo: process.env.EVAL_ROLL,
    accessCode: process.env.EVAL_ACCESS_CODE,
    clientID: process.env.EVAL_CLIENT_ID,
    clientSecret: process.env.EVAL_CLIENT_SECRET,
});
const PORT = Number(process.env.PORT || 8080);
const app = (0, app_1.createApp)();
app.listen(PORT, async () => {
    await (0, logging_middleware_1.Log)("backend", "info", "config", `server started on :${PORT}`);
});
