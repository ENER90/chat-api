import { Router } from "express";
import { register, login, getProfile } from "../controllers/auth.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

// 📝 POST /api/auth/register - Registrar nuevo usuario
router.post("/register", register);

// 🔐 POST /api/auth/login - Iniciar sesión
router.post("/login", login);

// 👤 GET /api/auth/me - Obtener perfil del usuario autenticado
router.get("/me", authenticateToken, getProfile);

export default router;










