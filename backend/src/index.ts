import dotenv from "dotenv";
dotenv.config();

import { initLogger, Log } from "@app/logging-middleware";
import { createApp } from "./app";

// Initialize logger with either access token (frontend-safe) or backend creds for auto auth.
initLogger({
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

const app = createApp();
app.listen(PORT, async () => {
  await Log("backend", "info", "config", `server started on :${PORT}`);
});

