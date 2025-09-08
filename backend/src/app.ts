import express from "express";
import cors from "cors";
import router from "./routes";
import { expressLogger } from "@app/logging-middleware";
import { errorHandler } from "./middleware/errorHandler";

export function createApp() {
  const app = express();
  app.use(express.json());
  app.use(
    cors({
      origin: ["http://localhost:3000"],
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: false,
    })
  );
  app.use(expressLogger({ stack: "backend", pkg: "middleware" }));
  app.use(router);
  app.use(errorHandler);
  return app;
}

