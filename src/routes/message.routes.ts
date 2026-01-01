import { Router } from "express";
import {
  sendMessage,
  getMessagesByRoom,
  editMessage,
  deleteMessage,
} from "../controllers/message.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

// POST /api/messages/:roomId - Send message to a room (requires auth)
router.post("/:roomId", authenticateToken, sendMessage);

// GET /api/messages/:roomId - Get messages from a room (requires auth)
router.get("/:roomId", authenticateToken, getMessagesByRoom);

// PUT /api/messages/:messageId - Edit a message (requires auth)
router.put("/:messageId", authenticateToken, editMessage);

// DELETE /api/messages/:messageId - Delete a message (requires auth)
router.delete("/:messageId", authenticateToken, deleteMessage);

export default router;




