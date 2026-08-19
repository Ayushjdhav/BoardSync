import { Router } from "express";
import {
  addComment,
  getCommentsForTask,
} from "../controllers/commentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);
router.post("/", addComment);
router.get("/task/:taskId", getCommentsForTask);

export default router;
