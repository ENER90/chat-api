import { Router } from "express";
import {
  sendMessage,
  getMessagesByRoom,
  editMessage,
  deleteMessage,
} from "../controllers/message.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

router.post("/:roomId", authenticateToken, sendMessage);
router.get("/:roomId", authenticateToken, getMessagesByRoom);
router.put("/:messageId", authenticateToken, editMessage);
router.delete("/:messageId", authenticateToken, deleteMessage);

export default router;




