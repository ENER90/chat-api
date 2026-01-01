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

router.post("/", authenticateToken, createRoom);
router.get("/", getAllRooms);
router.get("/:id", authenticateToken, getRoomById);
router.post("/:id/join", authenticateToken, joinRoom);
router.post("/:id/leave", authenticateToken, leaveRoom);

export default router;




