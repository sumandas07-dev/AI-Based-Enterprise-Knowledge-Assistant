import { Router } from "express";
import { getStatisticsController } from "../controllers/statistics.controller.js";
import { authenticateUser, requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();

// Expose statistics endpoint (admin only)
router.get("/", authenticateUser, requireAdmin, getStatisticsController);

export default router;
