import { LoggingClient } from "./client";
import { LoggerConfig, LogInput, Stack, Level, Pkg } from "./types";

export { Stack, Level, Pkg, LoggerConfig };

let defaultClient: LoggingClient | null = null;

export function initLogger(cfg: LoggerConfig) {
  defaultClient = new LoggingClient(cfg);
  return defaultClient;
}

export async function Log(stack: Stack, level: Level, pkg: Pkg, message: string) {
  if (!defaultClient) {
    defaultClient = new LoggingClient();
  }
  const payload: LogInput = { stack, level, package: pkg, message };
  await defaultClient.log(payload);
}

// Express request logging middleware (optional convenience)
// Logs request start and completion with status and duration.
export function expressLogger(opts?: { stack?: Stack; pkg?: Pkg }) {
  const stack = opts?.stack ?? ("backend" as Stack);
  const pkg = opts?.pkg ?? ("middleware" as Pkg);
  return function (req: any, res: any, next: any) {
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

