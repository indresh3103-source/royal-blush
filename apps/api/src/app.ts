import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import { ZodError } from "zod";
import multer from "multer";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import { allowedOrigins, env } from "./env.js";
import { logger } from "./logger.js";
import { prisma } from "./db.js";
import { ApiError } from "./helpers.js";
import { requireTrustedOrigin } from "./security.js";
import publicRoutes from "./routes/public.js";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin/index.js";

const here = dirname(fileURLToPath(import.meta.url));
const uploadsDir = resolve(here, "../uploads");
const webDist = env.WEB_DIST ? resolve(env.WEB_DIST) : resolve(here, "../../web/dist");

export const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(
  helmet({
    contentSecurityPolicy: env.SERVE_WEB
      ? {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
            imgSrc: ["'self'", "data:", "blob:", "https:"],
            mediaSrc: ["'self'", "blob:", "https:"],
            connectSrc: ["'self'"],
            objectSrc: ["'none'"],
            frameAncestors: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"]
          }
        }
      : false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" }
  })
);
app.use(compression());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "X-Requested-With"],
    maxAge: 86400
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());
app.use((req, _res, next) => {
  logger.debug({ method: req.method, path: req.path }, "request");
  next();
});
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 900,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    skip: (req) => req.path === "/api/health",
    message: { error: "Too many requests. Please slow down.", code: "RATE_LIMITED" }
  })
);

app.use("/uploads", express.static(uploadsDir, { maxAge: "365d", immutable: true, index: false }));

app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, service: "royal-blush-api", time: new Date().toISOString() });
  } catch {
    res.status(503).json({ ok: false, service: "royal-blush-api" });
  }
});

app.use("/api/public", publicRoutes);
app.use("/api/admin", requireTrustedOrigin);
app.use("/api/admin/auth", authRoutes);
app.use("/api/admin", adminRoutes);

if (env.SERVE_WEB) {
  if (existsSync(webDist)) {
    app.use(
      express.static(webDist, {
        maxAge: "1h",
        setHeaders: (res, path) => {
          if (path.endsWith("index.html")) {
            res.setHeader("Cache-Control", "no-store");
          }
        }
      })
    );
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api/") || req.path.startsWith("/uploads/")) {
        next();
        return;
      }
      res.sendFile(resolve(webDist, "index.html"));
    });
  } else {
    logger.warn({ webDist }, "SERVE_WEB is enabled but the web build was not found");
  }
}

app.use((_req, res) => {
  res.status(404).json({ error: "Not found", code: "NOT_FOUND" });
});

app.use((error: unknown, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      error: "Please check the highlighted fields.",
      code: "VALIDATION_ERROR",
      details: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message
      }))
    });
    return;
  }
  if (error instanceof ApiError) {
    res.status(error.status).json({
      error: error.message,
      code: error.code,
      ...(error.details ? { details: error.details } : {})
    });
    return;
  }
  if (error instanceof multer.MulterError) {
    res.status(400).json({
      error:
        error.code === "LIMIT_FILE_SIZE"
          ? "That file is too large."
          : error.code === "LIMIT_FILE_COUNT"
            ? "Too many files were selected."
            : "The upload could not be completed.",
      code: "UPLOAD_ERROR"
    });
    return;
  }
  if (typeof error === "object" && error && "code" in error && (error as { code?: string }).code === "P2002") {
    res.status(409).json({ error: "That record already exists.", code: "DUPLICATE_RECORD" });
    return;
  }
  logger.error({ error, method: req.method, path: req.path }, "Unhandled request error");
  res.status(500).json({
    error: env.NODE_ENV === "production" ? "Something went wrong. Please try again." : "Internal server error",
    code: "INTERNAL_ERROR"
  });
});
