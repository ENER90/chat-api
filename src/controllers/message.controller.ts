import { Response } from "express";
import { Message } from "../models/message.model";
import { Room } from "../models/room.model";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

// 💬 Send Message - Enviar mensaje a una sala
export const sendMessage = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { roomId } = req.params;
    const { content } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        error: "Unauthorized",
        message: "User not authenticated",
      });
      return;
    }

    if (!content || !content.trim()) {
      res.status(400).json({
        error: "Validation error",
        message: "Message content is required",
      });
      return;
    }

    const room = await Room.findById(roomId);

    if (!room) {
      res.status(404).json({
        error: "Not found",
        message: "Room not found",
      });
      return;
    }

    // Verificar que el usuario sea miembro de la sala
    const isMember = room.members.some(
      (memberId) => memberId.toString() === userId
    );

    if (!isMember) {
      res.status(403).json({
        error: "Forbidden",
        message: "You must be a member of this room to send messages",
      });
      return;
    }

    const newMessage = new Message({
      content: content.trim(),
      sender: userId,
      room: roomId,
    });

    await newMessage.save();
    await newMessage.populate("sender", "username avatar");

    res.status(201).json({
      message: "Message sent successfully",
      messageData: {
        id: newMessage._id,
        content: newMessage.content,
        sender: newMessage.sender,
        room: newMessage.room,
        isEdited: newMessage.isEdited,
        isDeleted: newMessage.isDeleted,
        createdAt: newMessage.createdAt,
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
      message: "Error sending message",
    });
  }
};

// 📋 Get Messages by Room - Obtener mensajes de una sala
export const getMessagesByRoom = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        error: "Unauthorized",
        message: "User not authenticated",
      });
      return;
    }

    const room = await Room.findById(roomId);

    if (!room) {
      res.status(404).json({
        error: "Not found",
        message: "Room not found",
      });
      return;
    }

    // Verificar que el usuario sea miembro de la sala
    const isMember = room.members.some(
      (memberId) => memberId.toString() === userId
    );

    if (!isMember) {
      res.status(403).json({
        error: "Forbidden",
        message: "You must be a member of this room to view messages",
      });
      return;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const messages = await Message.find({
      room: roomId,
      isDeleted: false,
    })
      .populate("sender", "username avatar status")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Message.countDocuments({
      room: roomId,
      isDeleted: false,
    });

    res.status(200).json({
      message: "Messages retrieved successfully",
      messages: messages.reverse(), // Mostrar del más antiguo al más reciente
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({
      error: "Internal server error",
      message: "Error retrieving messages",
    });
  }
};

// ✏️ Edit Message - Editar un mensaje (solo el autor)
export const editMessage = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        error: "Unauthorized",
        message: "User not authenticated",
      });
      return;
    }

    if (!content || !content.trim()) {
      res.status(400).json({
        error: "Validation error",
        message: "Message content is required",
      });
      return;
    }

    const message = await Message.findById(messageId);

    if (!message) {
      res.status(404).json({
        error: "Not found",
        message: "Message not found",
      });
      return;
    }

    if (message.isDeleted) {
      res.status(400).json({
        error: "Bad request",
        message: "Cannot edit a deleted message",
      });
      return;
    }

    // Verificar que el usuario sea el autor del mensaje
    if (message.sender.toString() !== userId) {
      res.status(403).json({
        error: "Forbidden",
        message: "You can only edit your own messages",
      });
      return;
    }

    message.content = content.trim();
    message.isEdited = true;
    await message.save();
    await message.populate("sender", "username avatar");

    res.status(200).json({
      message: "Message edited successfully",
      messageData: {
        id: message._id,
        content: message.content,
        sender: message.sender,
        room: message.room,
        isEdited: message.isEdited,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: "Internal server error",
      message: "Error editing message",
    });
  }
};

// 🗑️ Delete Message - Eliminar un mensaje (solo el autor)
export const deleteMessage = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { messageId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        error: "Unauthorized",
        message: "User not authenticated",
      });
      return;
    }

    const message = await Message.findById(messageId);

    if (!message) {
      res.status(404).json({
        error: "Not found",
        message: "Message not found",
      });
      return;
    }

    if (message.isDeleted) {
      res.status(400).json({
        error: "Bad request",
        message: "Message is already deleted",
      });
      return;
    }

    // Verificar que el usuario sea el autor del mensaje
    if (message.sender.toString() !== userId) {
      res.status(403).json({
        error: "Forbidden",
        message: "You can only delete your own messages",
      });
      return;
    }

    message.isDeleted = true;
    await message.save();

    res.status(200).json({
      message: "Message deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: "Internal server error",
      message: "Error deleting message",
    });
  }
};

