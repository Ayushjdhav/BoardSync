import { Router } from "express";
import healthRoutes from "./health.routes.js";
import userRoutes from "./user.routes.js";
import authRoutes from "./authRoutes.js";
import workspaceRoutes from "./workspaceRoutes.js";
import boardRoutes from "./boardRoutes.js";
import taskRoutes from "./taskRoutes.js";
import commentRoutes from "./commentRoutes.js";

const router = Router();

// Mount sub-routes
router.use("/", healthRoutes);
router.use("/", userRoutes);
router.use("/auth", authRoutes);
router.use("/workspaces", workspaceRoutes);
router.use("/boards", boardRoutes);
router.use("/tasks", taskRoutes);
router.use("/comments", commentRoutes);

export default router;
