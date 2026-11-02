import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { prisma } from "../db.js";
import { hashPassword, verifyPassword, issueSession, clearSession, resolveSession, requireAdmin, constantTimeEqual, asyncHandler, setNoStore } from "../security.js";
import { changePasswordSchema, loginSchema, setupSchema } from "../validation.js";
import { env } from "../env.js";
import { ApiError } from "../helpers.js";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 12,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many sign-in attempts. Please try again later.", code: "RATE_LIMITED" }
});

const setupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 8,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many setup attempts. Please try again later.", code: "RATE_LIMITED" }
});

function adminPayload(admin: { id: string; name: string; email: string; role: string }) {
  return { id: admin.id, name: admin.name, email: admin.email, role: admin.role };
}

router.get(
  "/status",
  asyncHandler(async (req, res) => {
    setNoStore(res);
    const adminCount = await prisma.adminUser.count();
    const session = await resolveSession(req);
    res.json({
      setupRequired: adminCount === 0,
      authenticated: Boolean(session),
      admin: session ? adminPayload(session.adminUser) : null
    });
  })
);

router.post(
  "/setup",
  setupLimiter,
  asyncHandler(async (req, res) => {
    setNoStore(res);
    const body = setupSchema.parse(req.body);
    const adminCount = await prisma.adminUser.count();
    if (adminCount > 0) {
      throw new ApiError(409, "An administrator already exists. Please sign in.", "SETUP_COMPLETE");
    }
    if (!constantTimeEqual(body.setupToken, env.SETUP_TOKEN)) {
      throw new ApiError(403, "The setup token is incorrect.", "INVALID_SETUP_TOKEN");
    }
    const admin = await prisma.adminUser.create({
      data: {
        name: body.name,
        email: body.email.toLowerCase(),
        passwordHash: await hashPassword(body.password),
        role: "OWNER"
      }
    });
    await issueSession(req, res, admin.id);
    res.status(201).json({ admin: adminPayload(admin) });
  })
);

router.post(
  "/login",
  loginLimiter,
  asyncHandler(async (req, res) => {
    setNoStore(res);
    const body = loginSchema.parse(req.body);
    const admin = await prisma.adminUser.findUnique({ where: { email: body.email.toLowerCase() } });
    if (!admin) {
      throw new ApiError(401, "Email or password is incorrect.", "INVALID_CREDENTIALS");
    }
    const valid = await verifyPassword(body.password, admin.passwordHash);
    if (!valid) {
      throw new ApiError(401, "Email or password is incorrect.", "INVALID_CREDENTIALS");
    }
    await issueSession(req, res, admin.id);
    await prisma.adminUser.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } });
    await prisma.session.deleteMany({
      where: {
        adminUserId: admin.id,
        expiresAt: { lt: new Date() }
      }
    });
    res.json({ admin: adminPayload(admin) });
  })
);

router.post(
  "/logout",
  asyncHandler(async (req, res) => {
    await clearSession(req, res);
    res.json({ ok: true });
  })
);

router.get(
  "/me",
  requireAdmin,
  asyncHandler(async (req, res) => {
    setNoStore(res);
    res.json({ admin: req.admin });
  })
);

router.post(
  "/change-password",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const body = changePasswordSchema.parse(req.body);
    const admin = await prisma.adminUser.findUniqueOrThrow({ where: { id: req.admin!.id } });
    const valid = await verifyPassword(body.currentPassword, admin.passwordHash);
    if (!valid) {
      throw new ApiError(400, "Your current password is incorrect.", "INVALID_CURRENT_PASSWORD");
    }
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { passwordHash: await hashPassword(body.newPassword) }
    });
    await prisma.session.deleteMany({
      where: {
        adminUserId: admin.id,
        id: { not: req.adminSessionId }
      }
    });
    res.json({ ok: true });
  })
);

export default router;
