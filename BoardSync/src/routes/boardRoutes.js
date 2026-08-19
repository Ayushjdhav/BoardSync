import { Router } from "express";
import {
  createBoard,
  getBoardsForWorkspace,
} from "../controllers/boardController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);
router.post("/", createBoard);
router.get("/workspace/:workspaceId", getBoardsForWorkspace);

export default router;
