import dotenv from "dotenv";
import { z } from "zod";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(process.cwd(), ".env") });
dotenv.config({ path: resolve(here, "../.env") });

const booleanValue = z.preprocess((value) => {
  if (value === true || value === "true" || value === "1") return true;
  if (value === false || value === "false" || value === "0" || value === undefined || value === "") return false;
  return value;
}, z.boolean());

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  PORT: z.coerce.number().int().positive().default(4000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  WEB_ORIGIN: z.string().default(process.env.RENDER_EXTERNAL_URL || "http://localhost:5173"),
  PUBLIC_SITE_URL: z.string().default(process.env.RENDER_EXTERNAL_URL || "http://localhost:5173"),
  SETUP_TOKEN: z.string().min(16),
  SESSION_SECRET: z.string().min(32),
  COOKIE_SECURE: booleanValue,
  SERVE_WEB: booleanValue,
  WEB_DIST: z.string().optional(),
  AWS_REGION: z.string().default("us-east-1"),
  AWS_ENDPOINT_URL_S3: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_PUBLIC_URL: z.string().optional(),
  ALLOW_LOCAL_STORAGE: booleanValue,
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_SECURE: booleanValue,
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default("Royal Blush <invitations@example.com>")
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export const allowedOrigins = Array.from(
  new Set(
    [env.WEB_ORIGIN, env.PUBLIC_SITE_URL]
      .flatMap((value) => value.split(","))
      .map((value) => value.trim())
      .filter(Boolean)
  )
);
