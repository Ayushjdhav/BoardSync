import dotenv from "dotenv";
import { createServer } from "http";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { setupSocket } from "./socket.js";

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

// Connect to Database and start server
const startServer = async () => {
  await connectDB();

  const httpServer = createServer(app);
  const io = setupSocket(httpServer);
  app.set("io", io);

  httpServer.listen(PORT, () => {
    console.log(`🚀 BoardSync server is running on http://localhost:${PORT}`);
    console.log(`🩺 Health check available at http://localhost:${PORT}/api/health`);
    console.log(`👥 Users route available at http://localhost:${PORT}/api/users`);
    console.log(`🔐 Signup route available at POST http://localhost:${PORT}/api/auth/signup`);
    console.log(`🔑 Login route available at POST http://localhost:${PORT}/api/auth/login`);
    console.log(`👤 Profile route (protected) available at GET http://localhost:${PORT}/api/auth/me`);
  });

  // Graceful shutdown handling
  const shutdown = (signal) => {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);
    io.close();
    httpServer.close(() => {
      console.log("Server closed.");
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
};

startServer();
