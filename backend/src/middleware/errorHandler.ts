import { Request, Response, NextFunction } from "express";
import { Log } from "@app/logging-middleware";

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const status = err?.status ?? 500;
  const message = err?.message ?? "Internal Server Error";
  Log("backend", "error", "middleware", `error ${status} ${message}`);
  res.status(status).json({ error: message });
}

