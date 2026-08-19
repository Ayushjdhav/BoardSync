import Task from "../models/Task.js";
import { getBoardAccess, getTaskAccess } from "../utils/access.js";

const accessError = (status) => ({
  error: status === 404 ? "Not Found" : "Forbidden",
  message:
    status === 404
      ? "Resource not found"
      : "You are not a member of this workspace",
});

export const createTask = async (req, res, next) => {
  try {
    const { title, description, board: boardId, assignee, dueDate, status } =
      req.body;

    if (!title || !title.trim() || !boardId) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Task title and board are required",
      });
    }

    const access = await getBoardAccess(boardId, req.user._id);
    if (access.status) {
      return res.status(access.status).json(accessError(access.status));
    }

    const task = await Task.create({
      title: title.trim(),
      description,
      board: boardId,
      status,
      assignee,
      dueDate,
    });

    const populatedTask = await task.populate("assignee", "name email");
    req.app
      .get("io")
      ?.to(String(boardId))
      .emit("taskCreated", populatedTask);

    return res.status(201).json({
      success: true,
      data: populatedTask,
    });
  } catch (error) {
    next(error);
  }
};

export const getTasksForBoard = async (req, res, next) => {
  try {
    const access = await getBoardAccess(req.params.boardId, req.user._id);
    if (access.status) {
      return res.status(access.status).json(accessError(access.status));
    }

    const tasks = await Task.find({ board: req.params.boardId })
      .populate("assignee", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const access = await getTaskAccess(req.params.taskId, req.user._id);
    if (access.status) {
      return res.status(access.status).json(accessError(access.status));
    }

    const allowedFields = [
      "title",
      "description",
      "status",
      "assignee",
      "dueDate",
    ];
    const requestedFields = Object.keys(req.body);
    const updates = Object.fromEntries(
      allowedFields
        .filter((field) => Object.prototype.hasOwnProperty.call(req.body, field))
        .map((field) => [field, req.body[field]])
    );

    if (!requestedFields.length || !Object.keys(updates).length) {
      return res.status(400).json({
        error: "Bad Request",
        message: "At least one task field is required",
      });
    }

    if (
      access.membership.role === "viewer" ||
      (access.membership.role === "member" &&
        Object.keys(updates).some(
          (field) => !["status", "assignee"].includes(field)
        ))
    ) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You do not have permission to edit these task fields",
      });
    }

    if (Object.prototype.hasOwnProperty.call(updates, "title")) {
      if (!updates.title || !updates.title.trim()) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Task title cannot be empty",
        });
      }
      updates.title = updates.title.trim();
    }

    const task = await Task.findByIdAndUpdate(req.params.taskId, updates, {
      returnDocument: "after",
      runValidators: true,
    }).populate("assignee", "name email");

    req.app
      .get("io")
      ?.to(String(access.board._id))
      .emit("taskUpdated", task);

    return res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const access = await getTaskAccess(req.params.taskId, req.user._id);
    if (access.status) {
      return res.status(access.status).json(accessError(access.status));
    }

    if (access.membership.role !== "owner") {
      return res.status(403).json({
        error: "Forbidden",
        message: "Only workspace owners can delete tasks",
      });
    }

    const deletedTask = access.task.toObject();
    await Task.findByIdAndDelete(req.params.taskId);
    req.app
      .get("io")
      ?.to(String(access.board._id))
      .emit("taskDeleted", deletedTask);

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
