import pino from "pino";
import { env } from "./env.js";

export const logger = pino({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "password",
      "passwordHash",
      "token",
      "tokenHash",
      "DATABASE_URL",
      "AWS_SECRET_ACCESS_KEY",
      "SETUP_TOKEN",
      "SESSION_SECRET"
    ],
    censor: "[redacted]"
  }
});
