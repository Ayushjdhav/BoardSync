import Comment from "../models/Comment.js";
import { getTaskAccess } from "../utils/access.js";

const taskAccessError = (status) => ({
  error: status === 404 ? "Not Found" : "Forbidden",
  message:
    status === 404
      ? "Task not found"
      : "You are not a member of this workspace",
});

export const addComment = async (req, res, next) => {
  try {
    const { task: taskId, content } = req.body;

    if (!taskId || !content || !content.trim()) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Task and comment content are required",
      });
    }

    const access = await getTaskAccess(taskId, req.user._id);
    if (access.status) {
      return res.status(access.status).json(taskAccessError(access.status));
    }

    const comment = await Comment.create({
      task: taskId,
      author: req.user._id,
      content: content.trim(),
    });

    const populatedComment = await comment.populate("author", "name email");
    req.app
      .get("io")
      ?.to(String(access.board._id))
      .emit("commentAdded", populatedComment);

    return res.status(201).json({
      success: true,
      data: populatedComment,
    });
  } catch (error) {
    next(error);
  }
};

export const getCommentsForTask = async (req, res, next) => {
  try {
    const access = await getTaskAccess(req.params.taskId, req.user._id);
    if (access.status) {
      return res.status(access.status).json(taskAccessError(access.status));
    }

    const comments = await Comment.find({ task: req.params.taskId })
      .populate("author", "name email")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: comments.length,
      data: comments,
    });
  } catch (error) {
    next(error);
  }
};
