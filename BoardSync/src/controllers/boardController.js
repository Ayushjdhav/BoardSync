import Board from "../models/Board.js";
import { getBoardAccess, getWorkspaceAccess } from "../utils/access.js";

export const createBoard = async (req, res, next) => {
  try {
    const { name, workspace: workspaceId } = req.body;

    if (!name || !name.trim() || !workspaceId) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Board name and workspace are required",
      });
    }

    const access = await getWorkspaceAccess(workspaceId, req.user._id);
    if (access.status) {
      return res.status(access.status).json({
        error: access.status === 404 ? "Not Found" : "Forbidden",
        message:
          access.status === 404
            ? "Workspace not found"
            : "You are not a member of this workspace",
      });
    }

    const board = await Board.create({
      name: name.trim(),
      workspace: workspaceId,
    });

    return res.status(201).json({
      success: true,
      data: board,
    });
  } catch (error) {
    next(error);
  }
};

export const getBoardsForWorkspace = async (req, res, next) => {
  try {
    const access = await getWorkspaceAccess(
      req.params.workspaceId,
      req.user._id
    );

    if (access.status) {
      return res.status(access.status).json({
        error: access.status === 404 ? "Not Found" : "Forbidden",
        message:
          access.status === 404
            ? "Workspace not found"
            : "You are not a member of this workspace",
      });
    }

    const boards = await Board.find({
      workspace: req.params.workspaceId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: boards.length,
      data: boards,
    });
  } catch (error) {
    next(error);
  }
};
