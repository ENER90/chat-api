import { Response } from "express";
import { Room } from "../models/room.model";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

// 📝 Create Room - Crear nueva sala
export const createRoom = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, description, type } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        error: "Unauthorized",
        message: "User not authenticated",
      });
      return;
    }

    if (!name) {
      res.status(400).json({
        error: "Validation error",
        message: "Room name is required",
      });
      return;
    }

    const newRoom = new Room({
      name,
      description,
      type: type || "public",
      createdBy: userId,
      members: [userId],
    });

    await newRoom.save();

    res.status(201).json({
      message: "Room created successfully",
      room: {
        id: newRoom._id,
        name: newRoom.name,
        description: newRoom.description,
        type: newRoom.type,
        createdBy: newRoom.createdBy,
        members: newRoom.members,
        createdAt: newRoom.createdAt,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "ValidationError") {
        res.status(400).json({
          error: "Validation error",
          message: error.message,
        });
        return;
      }
    }
    res.status(500).json({
      error: "Internal server error",
      message: "Error creating room",
    });
  }
};

// 📋 Get All Rooms - Obtener todas las salas públicas
export const getAllRooms = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { type } = req.query;

    const filter: any = {};
    if (type === "public") {
      filter.type = "public";
    }

    const rooms = await Room.find(filter)
      .populate("createdBy", "username avatar")
      .populate("members", "username avatar")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Rooms retrieved successfully",
      rooms: rooms.map((room) => ({
        id: room._id,
        name: room.name,
        description: room.description,
        type: room.type,
        createdBy: room.createdBy,
        membersCount: room.members.length,
        createdAt: room.createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({
      error: "Internal server error",
      message: "Error retrieving rooms",
    });
  }
};

// 🔍 Get Room By ID - Obtener detalles de una sala
export const getRoomById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const room = await Room.findById(id)
      .populate("createdBy", "username avatar")
      .populate("members", "username avatar status");

    if (!room) {
      res.status(404).json({
        error: "Not found",
        message: "Room not found",
      });
      return;
    }

    res.status(200).json({
      message: "Room retrieved successfully",
      room: {
        id: room._id,
        name: room.name,
        description: room.description,
        type: room.type,
        createdBy: room.createdBy,
        members: room.members,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: "Internal server error",
      message: "Error retrieving room",
    });
  }
};

// ➕ Join Room - Unirse a una sala
export const joinRoom = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        error: "Unauthorized",
        message: "User not authenticated",
      });
      return;
    }

    const room = await Room.findById(id);

    if (!room) {
      res.status(404).json({
        error: "Not found",
        message: "Room not found",
      });
      return;
    }

    if (room.members.includes(userId as any)) {
      res.status(400).json({
        error: "Bad request",
        message: "User is already a member of this room",
      });
      return;
    }

    room.members.push(userId as any);
    await room.save();

    res.status(200).json({
      message: "Successfully joined room",
      room: {
        id: room._id,
        name: room.name,
        membersCount: room.members.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: "Internal server error",
      message: "Error joining room",
    });
  }
};

// ➖ Leave Room - Salir de una sala
export const leaveRoom = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        error: "Unauthorized",
        message: "User not authenticated",
      });
      return;
    }

    const room = await Room.findById(id);

    if (!room) {
      res.status(404).json({
        error: "Not found",
        message: "Room not found",
      });
      return;
    }

    if (!room.members.includes(userId as any)) {
      res.status(400).json({
        error: "Bad request",
        message: "User is not a member of this room",
      });
      return;
    }

    room.members = room.members.filter(
      (memberId) => memberId.toString() !== userId
    );
    await room.save();

    res.status(200).json({
      message: "Successfully left room",
      room: {
        id: room._id,
        name: room.name,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: "Internal server error",
      message: "Error leaving room",
    });
  }
};





