import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import roomRoutes from "./routes/room.routes";
import messageRoutes from "./routes/message.routes";
import { errorHandler } from "./middlewares/error.middleware";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3004",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Chat API is running",
    timestamp: new Date().toISOString(),
  });
});

// API info route
app.get("/api", (req, res) => {
  res.status(200).json({
    message: "Real-time Chat API",
    version: "1.0.0",
    endpoints: {
      health: "GET /health",
      api: "GET /api",
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
        profile: "GET /api/auth/me (requires auth)",
      },
      rooms: {
        create: "POST /api/rooms (requires auth)",
        getAll: "GET /api/rooms",
        getById: "GET /api/rooms/:id (requires auth)",
        join: "POST /api/rooms/:id/join (requires auth)",
        leave: "POST /api/rooms/:id/leave (requires auth)",
      },
      messages: {
        send: "POST /api/messages/:roomId (requires auth)",
        getByRoom: "GET /api/messages/:roomId (requires auth)",
        edit: "PUT /api/messages/:messageId (requires auth)",
        delete: "DELETE /api/messages/:messageId (requires auth)",
      },
    },
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/messages", messageRoutes);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;

