import { Router, Request, Response, NextFunction } from "express";
import { shortenerService } from "./services/shortener";
import { Log } from "@app/logging-middleware";

const router = Router();

router.post("/shorturls", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const origin = deriveOrigin(req);
    const { short, shortLink } = await shortenerService.create(req.body, origin);
    await Log("backend", "info", "handler", `created ${short.shortcode}`);
    res.status(201).json({ shortLink, expiry: short.expiresAt });
  } catch (err) {
    next(err);
  }
});

router.get("/shorturls/:code", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const code = req.params.code;
    const stats = await shortenerService.stats(code);
    await Log("backend", "debug", "handler", `stats ${code}`);
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

router.get("/:code", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const code = req.params.code;
    const ip = getIp(req);
    const referrer = req.get("referer") || req.get("referrer") || undefined;
    const url = await shortenerService.resolveAndRecord(code, referrer, ip);
    await Log("backend", "info", "handler", `redirect ${code}`);
    res.redirect(302, url);
  } catch (err) {
    next(err);
  }
});

function deriveOrigin(req: Request): string {
  const protocol = (req.headers["x-forwarded-proto"] as string) || req.protocol || "http";
  const host = req.get("host") || "localhost";
  return `${protocol}://${host}`;
}

function getIp(req: Request): string {
  const xfwd = (req.headers["x-forwarded-for"] as string) || "";
  const first = xfwd.split(",")[0].trim();
  return first || (req.socket?.remoteAddress ?? "");
}

export default router;

