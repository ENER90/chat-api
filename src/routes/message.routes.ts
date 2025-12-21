import { Router } from "express";
import {
  sendMessage,
  getMessagesByRoom,
  editMessage,
  deleteMessage,
} from "../controllers/message.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

// 💬 POST /api/messages/:roomId - Enviar mensaje a una sala (requiere autenticación)
router.post("/:roomId", authenticateToken, sendMessage);

// 📋 GET /api/messages/:roomId - Obtener mensajes de una sala (requiere autenticación)
router.get("/:roomId", authenticateToken, getMessagesByRoom);

// ✏️ PUT /api/messages/:messageId - Editar un mensaje (requiere autenticación)
router.put("/:messageId", authenticateToken, editMessage);

// 🗑️ DELETE /api/messages/:messageId - Eliminar un mensaje (requiere autenticación)
router.delete("/:messageId", authenticateToken, deleteMessage);

export default router;



