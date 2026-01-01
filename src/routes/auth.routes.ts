import { Router } from "express";
import { register, login, getProfile } from "../controllers/auth.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

// POST /api/auth/register - Register new user
router.post("/register", register);

// POST /api/auth/login - Login user
router.post("/login", login);

// GET /api/auth/me - Get authenticated user's profile
router.get("/me", authenticateToken, getProfile);

export default router;










