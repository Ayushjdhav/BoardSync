import { Router } from "express";
import {
  createTask,
  deleteTask,
  getTasksForBoard,
  updateTask,
} from "../controllers/taskController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);
router.post("/", createTask);
router.get("/board/:boardId", getTasksForBoard);
router.patch("/:taskId", updateTask);
router.delete("/:taskId", deleteTask);

export default router;
