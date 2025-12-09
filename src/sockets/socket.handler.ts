import { Server as SocketServer } from "socket.io";
import { Server as HttpServer } from "http";
import { verifyToken, JwtPayload } from "../utils/jwt";
import { Message } from "../models/message.model";
import { Room } from "../models/room.model";
import { User } from "../models/user.model";

export const initializeSocket = (httpServer: HttpServer): SocketServer => {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || "http://localhost:3004",
      credentials: true,
    },
  });

  // Middleware de autenticación
  io.use(async (socket: any, next) => {
    try {
      const token = socket.handshake.auth.token || 
        socket.handshake.headers.authorization?.replace("Bearer ", "");

      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = verifyToken(token);
      socket.user = decoded;

      // Actualizar estado del usuario a online
      if (decoded.userId) {
        await User.findByIdAndUpdate(decoded.userId, {
          status: "online",
          lastSeen: new Date(),
        });
      }

      next();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("expired")) {
          return next(new Error("Authentication error: Token expired"));
        }
        if (error.message.includes("invalid")) {
          return next(new Error("Authentication error: Invalid token"));
        }
      }
      return next(new Error("Authentication error: Token verification failed"));
    }
  });

  io.on("connection", async (socket: any) => {
    if (!socket.user) {
      socket.disconnect();
      return;
    }

    const userId = socket.user.userId;
    console.log(`✅ User connected: ${socket.user.email} (${socket.id})`);

    // Unirse a las salas donde el usuario es miembro
    try {
      const userRooms = await Room.find({ members: userId });
      userRooms.forEach((room) => {
        socket.join(room._id.toString());
        console.log(`📥 User ${socket.user?.email} joined room: ${room.name}`);
      });
    } catch (error) {
      console.error("Error joining user rooms:", error);
    }

    // Evento: Unirse a una sala
    socket.on("join_room", async (roomId: string) => {
      try {
        const room = await Room.findById(roomId);

        if (!room) {
          socket.emit("error", { message: "Room not found" });
          return;
        }

        const isMember = room.members.some(
          (memberId) => memberId.toString() === userId
        );

        if (!isMember) {
          socket.emit("error", {
            message: "You must be a member of this room",
          });
          return;
        }

        socket.join(roomId);
        socket.emit("joined_room", { roomId, roomName: room.name });

        // Notificar a otros usuarios en la sala
        socket.to(roomId).emit("user_joined", {
          userId,
          roomId,
          message: `User joined the room`,
        });

        console.log(`📥 User ${socket.user?.email} joined room: ${room.name}`);
      } catch (error) {
        socket.emit("error", { message: "Error joining room" });
        console.error("Error in join_room:", error);
      }
    });

    // Evento: Salir de una sala
    socket.on("leave_room", async (roomId: string) => {
      try {
        socket.leave(roomId);
        socket.emit("left_room", { roomId });

        // Notificar a otros usuarios en la sala
        socket.to(roomId).emit("user_left", {
          userId,
          roomId,
          message: `User left the room`,
        });

        console.log(`📤 User ${socket.user?.email} left room: ${roomId}`);
      } catch (error) {
        socket.emit("error", { message: "Error leaving room" });
        console.error("Error in leave_room:", error);
      }
    });

    // Evento: Enviar mensaje
    socket.on("send_message", async (data: { roomId: string; content: string }) => {
      try {
        const { roomId, content } = data;

        if (!content || !content.trim()) {
          socket.emit("error", { message: "Message content is required" });
          return;
        }

        const room = await Room.findById(roomId);

        if (!room) {
          socket.emit("error", { message: "Room not found" });
          return;
        }

        const isMember = room.members.some(
          (memberId) => memberId.toString() === userId
        );

        if (!isMember) {
          socket.emit("error", {
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
        await newMessage.populate("sender", "username avatar status");

        // Emitir mensaje a todos en la sala (incluyendo el remitente)
        io.to(roomId).emit("new_message", {
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
        });

        console.log(`💬 Message sent in room ${room.name} by ${socket.user?.email}`);
      } catch (error) {
        socket.emit("error", { message: "Error sending message" });
        console.error("Error in send_message:", error);
      }
    });

    // Evento: Editar mensaje
    socket.on("edit_message", async (data: { messageId: string; content: string }) => {
      try {
        const { messageId, content } = data;

        if (!content || !content.trim()) {
          socket.emit("error", { message: "Message content is required" });
          return;
        }

        const message = await Message.findById(messageId);

        if (!message) {
          socket.emit("error", { message: "Message not found" });
          return;
        }

        if (message.sender.toString() !== userId) {
          socket.emit("error", {
            message: "You can only edit your own messages",
          });
          return;
        }

        if (message.isDeleted) {
          socket.emit("error", { message: "Cannot edit a deleted message" });
          return;
        }

        message.content = content.trim();
        message.isEdited = true;
        await message.save();
        await message.populate("sender", "username avatar");

        // Emitir mensaje editado a todos en la sala
        io.to(message.room.toString()).emit("message_edited", {
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
        });

        console.log(`✏️ Message edited by ${socket.user?.email}`);
      } catch (error) {
        socket.emit("error", { message: "Error editing message" });
        console.error("Error in edit_message:", error);
      }
    });

    // Evento: Eliminar mensaje
    socket.on("delete_message", async (messageId: string) => {
      try {
        const message = await Message.findById(messageId);

        if (!message) {
          socket.emit("error", { message: "Message not found" });
          return;
        }

        if (message.sender.toString() !== userId) {
          socket.emit("error", {
            message: "You can only delete your own messages",
          });
          return;
        }

        message.isDeleted = true;
        await message.save();

        // Emitir mensaje eliminado a todos en la sala
        io.to(message.room.toString()).emit("message_deleted", {
          messageId: message._id,
          roomId: message.room.toString(),
        });

        console.log(`🗑️ Message deleted by ${socket.user?.email}`);
      } catch (error) {
        socket.emit("error", { message: "Error deleting message" });
        console.error("Error in delete_message:", error);
      }
    });

    // Evento: Desconexión
    socket.on("disconnect", async () => {
      try {
        // Actualizar estado del usuario a offline
        if (userId) {
          await User.findByIdAndUpdate(userId, {
            status: "offline",
            lastSeen: new Date(),
          });
        }

        console.log(`❌ User disconnected: ${socket.user?.email} (${socket.id})`);
      } catch (error) {
        console.error("Error updating user status on disconnect:", error);
      }
    });
  });

  return io;
};

