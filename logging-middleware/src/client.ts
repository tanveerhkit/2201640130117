import fetch from "cross-fetch";
import { LoggerConfig, LogInput, TokenResponse } from "./types";

export class LoggingClient {
  private baseURL: string;
  private logPath: string;
  private authPath: string;
  private accessToken?: string;
  private tokenExpiry?: number; // epoch seconds

  private creds?: Required<Pick<LoggerConfig, "email" | "name" | "rollNo" | "accessCode" | "clientID" | "clientSecret">>;

  constructor(cfg: LoggerConfig = {}) {
    this.baseURL = (cfg.baseURL ?? "http://20.244.56.144").replace(/\/$/, "");
    this.logPath = cfg.logPath ?? "/evaluation-service/logs";
    this.authPath = cfg.authPath ?? "/evaluation-service/auth";
    this.accessToken = cfg.accessToken;

    if (!cfg.accessToken) {
      // Allow backend to supply credentials for token fetch.
      const { email, name, rollNo, accessCode, clientID, clientSecret } = cfg;
      if (email && name && rollNo && accessCode && clientID && clientSecret) {
        this.creds = { email, name, rollNo, accessCode, clientID, clientSecret };
      }
    }
  }

  private isTokenValid(): boolean {
    if (!this.accessToken || !this.tokenExpiry) return false;
    const now = Math.floor(Date.now() / 1000);
    // Refresh 60s early
    return now < this.tokenExpiry - 60;
  }

  private async ensureToken(): Promise<string | undefined> {
    if (this.isTokenValid()) return this.accessToken;
    if (!this.creds) return this.accessToken; // frontend mode: use provided token as-is

    const url = `${this.baseURL}${this.authPath}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(this.creds),
    });
    if (!res.ok) {
      // Do not throw to avoid breaking apps; swallow but return undefined
      return this.accessToken;
    }
    const data = (await res.json()) as TokenResponse;
    this.accessToken = data.access_token;
    this.tokenExpiry = data.expires_in;
    return this.accessToken;
  }

  async log(input: LogInput): Promise<void> {
    try {
      await this.ensureToken();
      const url = `${this.baseURL}${this.logPath}`;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (this.accessToken) headers["Authorization"] = `Bearer ${this.accessToken}`;
      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(input),
      });
      // Avoid throwing; the consumer shouldn't break from logging failures.
      // If needed, response could be inspected by callers later via a callback.
      void res; // no-op
    } catch {
      // Swallow errors to keep middleware safe and non-disruptive.
    }
  }
}

