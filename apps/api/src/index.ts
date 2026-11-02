import { app } from "./app.js";
import { env } from "./env.js";
import { logger } from "./logger.js";
import { prisma } from "./db.js";

const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT, environment: env.NODE_ENV }, "Royal Blush API is listening");
});

async function shutdown(signal: string) {
  logger.info({ signal }, "Shutting down");
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("unhandledRejection", (error) => {
  logger.error({ error }, "Unhandled promise rejection");
});
