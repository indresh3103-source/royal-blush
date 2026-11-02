import { Router } from "express";
import { requireAdmin, requireAdminHeader } from "../../security.js";
import coreRoutes from "./core.js";
import mediaRoutes from "./media.js";
import rsvpRoutes from "./rsvps.js";

const router = Router();

router.use(requireAdminHeader);
router.use(requireAdmin);
router.use(coreRoutes);
router.use(mediaRoutes);
router.use(rsvpRoutes);

export default router;
