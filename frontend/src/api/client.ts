import { Log } from "@app/logging-middleware";

const BASE = (process as any).env?.REACT_APP_BACKEND_URL || "http://localhost:8080";

export interface CreateReq {
  url: string;
  validity?: number;
  shortcode?: string;
}

export interface CreateResp {
  shortLink: string;
  expiry: string;
}

export async function createShortUrl(req: CreateReq): Promise<CreateResp> {
  await Log("frontend", "debug", "api", `create request ${req.shortcode ?? "auto"}`);
  const res = await fetch(`${BASE}/shorturls`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  const body = await res.json();
  if (!res.ok) {
    await Log("frontend", "error", "api", `create failed ${body?.error ?? res.status}`);
    throw new Error(body?.error || "Failed to create short url");
  }
  await Log("frontend", "info", "api", `create success`);
  return body as CreateResp;
}

export interface StatsResp {
  shortcode: string;
  url: string;
  createdAt: string;
  expiresAt: string;
  totalClicks: number;
  clicks: { timestamp: string; source: string; location: string }[];
}

export async function getStats(code: string): Promise<StatsResp> {
  await Log("frontend", "debug", "api", `stats request ${code}`);
  const res = await fetch(`${BASE}/shorturls/${code}`);
  const body = await res.json();
  if (!res.ok) {
    await Log("frontend", "error", "api", `stats failed ${body?.error ?? res.status}`);
    throw new Error(body?.error || "Failed to fetch stats");
  }
  return body as StatsResp;
}

