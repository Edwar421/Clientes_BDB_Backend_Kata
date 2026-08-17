import express from "express";
import { getAuditLogs } from "../modules/audit/audit.controller";
import { authenticateToken, authorizeRoles } from "../modules/auth/auth.middleware";
import { UserRole } from "../modules/auth/auth.types";

const router = express.Router();

router.use(authenticateToken);
router.get("/", authorizeRoles(UserRole.ADMIN), getAuditLogs);

export default router;
