import { App } from "./app";
import { Database } from "./config/database";
import { env } from "./config/env";
import { Logger } from "./common/utils/logger";

const bootstrap = async (): Promise<void> => {
  await Database.connect();
  const app = new App().instance;

  const server = app.listen(env.PORT, () => {
    Logger.info(`Server listening on port ${env.PORT}`);
  });

  const shutdown = async (signal: string) => {
    Logger.info(`Received ${signal}. Shutting down...`);
    server.close(async () => {
      await Database.disconnect();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => {
    void shutdown("SIGINT");
  });

  process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
  });
};

bootstrap().catch((error) => {
  Logger.error("Failed to start server", error);
  process.exit(1);
});
