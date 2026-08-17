import express from "express";
import { login, getCurrentUser } from "../modules/auth/auth.controller";
import { authenticateToken } from "../modules/auth/auth.middleware";

const router = express.Router();

router.post("/login", login);
router.get("/me", authenticateToken, getCurrentUser);

export default router;
