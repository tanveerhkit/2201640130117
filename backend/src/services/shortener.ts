import { store } from "../store/memoryStore";
import { ClickEvent, CreateShortUrlRequest, ShortUrl, ShortUrlRecord } from "../types";
import { generateShortcode, isValidShortcode, isValidURL } from "../utils/shortcode";
import { Log } from "@app/logging-middleware";

function computeExpiry(validityMinutes?: number): string {
  const minutes = typeof validityMinutes === "number" && validityMinutes > 0 ? validityMinutes : 30;
  const expires = new Date(Date.now() + minutes * 60 * 1000);
  return expires.toISOString();
}

export class ShortenerService {
  async create(data: CreateShortUrlRequest, origin: string): Promise<{ short: ShortUrl; shortLink: string }> {
    const { url, validity, shortcode } = data;
    if (!url || !isValidURL(url)) {
      await Log("backend", "warn", "service", "create invalid url");
      throw Object.assign(new Error("Invalid URL"), { status: 400 });
    }

    let code: string;
    if (shortcode) {
      if (!isValidShortcode(shortcode)) {
        await Log("backend", "warn", "service", "invalid shortcode format");
        throw Object.assign(new Error("Invalid shortcode. Use 4-20 alphanumeric."), { status: 400 });
      }
      if (store.has(shortcode)) {
        await Log("backend", "info", "service", "shortcode collision");
        throw Object.assign(new Error("Shortcode already in use"), { status: 409 });
      }
      code = shortcode;
    } else {
      // Generate until unique
      let attempt = 0;
      do {
        code = generateShortcode();
        attempt++;
      } while (store.has(code) && attempt < 5);
      if (store.has(code)) {
        await Log("backend", "error", "service", "failed to generate unique shortcode");
        throw Object.assign(new Error("Could not generate unique shortcode"), { status: 500 });
      }
    }

    const now = new Date().toISOString();
    const expiresAt = computeExpiry(validity);
    const record: ShortUrlRecord = {
      shortcode: code!,
      url,
      createdAt: now,
      expiresAt,
      clicks: [],
    };
    store.save(record);
    await Log("backend", "info", "service", `created shortcode ${code}`);
    const short: ShortUrl = { shortcode: code!, url, createdAt: now, expiresAt };
    const shortLink = `${origin}/${code}`;
    return { short, shortLink };
  }

  async stats(code: string): Promise<{
    shortcode: string;
    url: string;
    createdAt: string;
    expiresAt: string;
    totalClicks: number;
    clicks: Omit<ClickEvent, "ip">[];
  }> {
    const rec = store.get(code);
    if (!rec) {
      await Log("backend", "warn", "service", "stats not found");
      throw Object.assign(new Error("Shortcode not found"), { status: 404 });
    }
    const clicks = rec.clicks.map(({ ip, ...rest }) => rest);
    return {
      shortcode: rec.shortcode,
      url: rec.url,
      createdAt: rec.createdAt,
      expiresAt: rec.expiresAt,
      totalClicks: rec.clicks.length,
      clicks,
    };
  }

  async resolveAndRecord(code: string, referrer: string | undefined, ip: string): Promise<string> {
    const rec = store.get(code);
    if (!rec) {
      await Log("backend", "warn", "service", "redirect not found");
      throw Object.assign(new Error("Shortcode not found"), { status: 404 });
    }
    const now = new Date();
    const expired = now > new Date(rec.expiresAt);
    if (expired) {
      await Log("backend", "info", "service", "redirect expired");
      throw Object.assign(new Error("Link expired"), { status: 410 });
    }
    const source = referrer ? safeHostname(referrer) : "direct";
    const location = coarseLocation(ip);
    const click: ClickEvent = {
      timestamp: now.toISOString(),
      source,
      location,
      ip,
    };
    rec.clicks.push(click);
    await Log("backend", "debug", "service", `click recorded ${code}`);
    return rec.url;
  }
}

function safeHostname(referrer: string): string {
  try {
    const u = new URL(referrer);
    return u.hostname;
  } catch {
    return "unknown";
  }
}

function coarseLocation(ip: string): string {
  // Coarse classification without external geo dependency
  if (!ip) return "unknown";
  if (ip.startsWith("10.")) return "private-10.x";
  if (ip.startsWith("192.168.")) return "private-192.168.x";
  if (ip.startsWith("172.")) {
    const s = ip.split(".");
    const second = Number(s[1]);
    if (second >= 16 && second <= 31) return "private-172.16-31.x";
  }
  return "public";
}

export const shortenerService = new ShortenerService();

