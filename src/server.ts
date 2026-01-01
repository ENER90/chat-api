import dotenv from "dotenv";
import http from "http";
import app from "./app";
import { connectDB } from "./utils/database";
import { initializeSocket } from "./sockets/socket.handler";

dotenv.config();

const PORT = process.env.PORT || 3004;

const startServer = async () => {
  try {
    await connectDB();

    // Create HTTP server
    const httpServer = http.createServer(app);

    // Initialize Socket.io
    const io = initializeSocket(httpServer);

    // Start server
    httpServer.listen(PORT, () => {
      console.log(`🚀 Chat API Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🔌 WebSocket server initialized`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

