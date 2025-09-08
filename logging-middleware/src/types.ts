export type Stack = "backend" | "frontend";
export type Level = "debug" | "info" | "warn" | "error" | "fatal";
export type Pkg =
  | "cache"
  | "controller"
  | "cron_job"
  | "db"
  | "domain"
  | "handler"
  | "repository"
  | "route"
  | "service"
  | "api"
  | "component"
  | "hook"
  | "page"
  | "state"
  | "style"
  | "auth"
  | "config"
  | "middleware"
  | "utils";

export interface LoggerConfig {
  baseURL?: string; // default http://20.244.56.144
  logPath?: string; // default /evaluation-service/logs
  authPath?: string; // default /evaluation-service/auth
  // Prefer passing accessToken (frontend-safe). If omitted, provide client credentials (backend only).
  accessToken?: string;
  email?: string;
  name?: string;
  rollNo?: string;
  accessCode?: string;
  clientID?: string;
  clientSecret?: string;
}

export interface LogInput {
  stack: Stack;
  level: Level;
  package: Pkg;
  message: string;
}

export interface TokenResponse {
  token_type: string;
  access_token: string;
  expires_in: number; // epoch seconds (as per sample)
}

