import { LoggerConfig, LogInput } from "./types";
export declare class LoggingClient {
    private baseURL;
    private logPath;
    private authPath;
    private accessToken?;
    private tokenExpiry?;
    private creds?;
    constructor(cfg?: LoggerConfig);
    private isTokenValid;
    private ensureToken;
    log(input: LogInput): Promise<void>;
}
