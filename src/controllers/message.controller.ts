import { Response } from "express";
import { Message } from "../models/message.model";
import { Room } from "../models/room.model";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

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

    const isMember = room.members.some(
      (memberId) => memberId.toString() === userId
    );

    if (!isMember) {
      res.status(403).json({
        error: "Forbidden",
        message: "You are not a member of this room",
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
      message: {
        id: newMessage._id,
        content: newMessage.content,
        sender: {
          id: newMessage.sender,
          username: (newMessage.sender as any).username,
          avatar: (newMessage.sender as any).avatar,
        },
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

    const isMember = room.members.some(
      (memberId) => memberId.toString() === userId
    );

    if (!isMember) {
      res.status(403).json({
        error: "Forbidden",
        message: "You are not a member of this room",
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
      messages: messages.reverse().map((msg) => ({ // Reverse for chronological order
        id: msg._id,
        content: msg.content,
        sender: {
          id: msg.sender,
          username: (msg.sender as any).username,
          avatar: (msg.sender as any).avatar,
          status: (msg.sender as any).status,
        },
        room: msg.room,
        isEdited: msg.isEdited,
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt,
      })),
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

    if (message.sender.toString() !== userId) {
      res.status(403).json({
        error: "Forbidden",
        message: "You can only edit your own messages",
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

    message.content = content.trim();
    message.isEdited = true;
    await message.save();
    await message.populate("sender", "username avatar");

    res.status(200).json({
      message: "Message updated successfully",
      message: {
        id: message._id,
        content: message.content,
        sender: {
          id: message.sender,
          username: (message.sender as any).username,
          avatar: (message.sender as any).avatar,
        },
        room: message.room,
        isEdited: message.isEdited,
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
      message: {
        id: message._id,
        room: message.room,
        isDeleted: message.isDeleted,
        updatedAt: message.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: "Internal server error",
      message: "Error deleting message",
    });
  }
};



