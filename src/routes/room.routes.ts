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

// POST /api/rooms - Create new room (requires auth)
router.post("/", authenticateToken, createRoom);

// GET /api/rooms - Get all public rooms
router.get("/", getAllRooms);

// GET /api/rooms/:id - Get room details (requires auth)
router.get("/:id", authenticateToken, getRoomById);

// POST /api/rooms/:id/join - Join a room (requires auth)
router.post("/:id/join", authenticateToken, joinRoom);

// POST /api/rooms/:id/leave - Leave a room (requires auth)
router.post("/:id/leave", authenticateToken, leaveRoom);

export default router;




