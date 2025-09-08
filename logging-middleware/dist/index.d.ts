import { LoggingClient } from "./client";
import { LoggerConfig, Stack, Level, Pkg } from "./types";
export { Stack, Level, Pkg, LoggerConfig };
export declare function initLogger(cfg: LoggerConfig): LoggingClient;
export declare function Log(stack: Stack, level: Level, pkg: Pkg, message: string): Promise<void>;
export declare function expressLogger(opts?: {
    stack?: Stack;
    pkg?: Pkg;
}): (req: any, res: any, next: any) => void;
