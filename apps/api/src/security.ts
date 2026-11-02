import type { NextFunction, Request, RequestHandler, Response } from "express";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "./db.js";
import { allowedOrigins, env } from "./env.js";
import { logger } from "./logger.js";

export const SESSION_COOKIE = "rb_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function hashIp(ip: string | undefined) {
  if (!ip) return null;
  return createHmac("sha256", env.SESSION_SECRET).update(ip).digest("hex");
}

export function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function constantTimeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function issueSession(req: Request, res: Response, adminUserId: string) {
  const token = randomBytes(32).toString("base64url");
  await prisma.session.create({
    data: {
      tokenHash: hashToken(token),
      adminUserId,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
      userAgent: req.get("user-agent")?.slice(0, 300) ?? null,
      ipHash: hashIp(req.ip)
    }
  });
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_TTL_MS
  });
}

export async function clearSession(req: Request, res: Response) {
  const token = req.cookies?.[SESSION_COOKIE];
  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }
  res.clearCookie(SESSION_COOKIE, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: "strict",
    path: "/"
  });
}

export async function resolveSession(req: Request) {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { adminUser: true }
  });
  if (!session) return null;
  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => undefined);
    return null;
  }
  return session;
}

export const requireAdmin: RequestHandler = async (req, res, next) => {
  try {
    const session = await resolveSession(req);
    if (!session) {
      res.status(401).json({ error: "Authentication required", code: "UNAUTHENTICATED" });
      return;
    }
    req.admin = {
      id: session.adminUser.id,
      name: session.adminUser.name,
      email: session.adminUser.email,
      role: session.adminUser.role
    };
    req.adminSessionId = session.id;
    next();
  } catch (error) {
    next(error);
  }
};

export const requireTrustedOrigin: RequestHandler = (req, res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    next();
    return;
  }
  const origin = req.get("origin") ?? req.get("referer");
  if (!origin) {
    next();
    return;
  }
  try {
    const parsed = new URL(origin);
    if (allowedOrigins.includes(parsed.origin)) {
      next();
      return;
    }
  } catch {
    logger.warn({ origin }, "Rejected request with malformed origin");
  }
  res.status(403).json({ error: "Request origin is not allowed", code: "ORIGIN_NOT_ALLOWED" });
};

export const requireAdminHeader: RequestHandler = (req, res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    next();
    return;
  }
  if (req.get("x-requested-with") !== "RoyalBlushAdmin") {
    res.status(403).json({ error: "Missing request verification header", code: "REQUEST_VERIFICATION_FAILED" });
    return;
  }
  next();
};

export function setNoStore(res: Response) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("Pragma", "no-cache");
}

export function asyncHandler(handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
}
