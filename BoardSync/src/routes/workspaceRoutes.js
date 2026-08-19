import { Router } from "express";
import {
  createWorkspace,
  getMyWorkspaces,
  getWorkspaceById,
} from "../controllers/workspaceController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);
router.post("/", createWorkspace);
router.get("/", getMyWorkspaces);
router.get("/:workspaceId", getWorkspaceById);

export default router;
