import { Router } from "express";
import {
  createRoom,
  getAllRooms,
  getRoomById,
  joinRoom,
  leaveRoom,
} from "../controllers/room.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

// 📝 POST /api/rooms - Crear nueva sala (requiere autenticación)
router.post("/", authenticateToken, createRoom);

// 📋 GET /api/rooms - Obtener todas las salas públicas
router.get("/", getAllRooms);

// 🔍 GET /api/rooms/:id - Obtener detalles de una sala (requiere autenticación)
router.get("/:id", authenticateToken, getRoomById);

// ➕ POST /api/rooms/:id/join - Unirse a una sala (requiere autenticación)
router.post("/:id/join", authenticateToken, joinRoom);

// ➖ POST /api/rooms/:id/leave - Salir de una sala (requiere autenticación)
router.post("/:id/leave", authenticateToken, leaveRoom);

export default router;




