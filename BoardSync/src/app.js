import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import apiRoutes from "./routes/index.js";
import { notFoundHandler } from "./middleware/notFound.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";

dotenv.config();

const app = express();

// Global Middleware
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN || "*",
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root Route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to BoardSync API",
    healthCheck: "/api/health",
  });
});

// API Routes
app.use("/api", apiRoutes);

// 404 Handler
app.use(notFoundHandler);

// Centralized Error Handler
app.use(errorHandler);

export default app;
