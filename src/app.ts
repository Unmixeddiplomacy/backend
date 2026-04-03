import cors from "cors";
import express, { Express } from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { setupSwagger } from "./config/swagger";
import { errorHandler } from "./common/middleware/errorHandler";
import { notFoundMiddleware } from "./common/middleware/notFound";
import { requestIdMiddleware } from "./common/middleware/requestId";
import { apiRateLimiter } from "./common/middleware/rateLimiter";
import { apiRouter } from "./routes";

export class App {
  public readonly instance: Express;

  constructor() {
    this.instance = express();
    this.configureMiddleware();
    this.configureRoutes();
    this.configureErrorHandling();
  }

  private configureMiddleware(): void {
    this.instance.use(helmet());
    this.instance.use(
      cors({
        origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN
      })
    );
    this.instance.use(express.json({ limit: "1mb" }));
    this.instance.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
    this.instance.use(requestIdMiddleware);
    this.instance.use(apiRateLimiter);
  }

  private configureRoutes(): void {
    setupSwagger(this.instance);
    this.instance.use("/api", apiRouter);
  }

  private configureErrorHandling(): void {
    this.instance.use(notFoundMiddleware);
    this.instance.use(errorHandler);
  }
}
