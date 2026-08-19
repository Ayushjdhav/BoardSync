import { getWorkspaceAccess } from "../utils/access.js";
import Workspace from "../models/Workspace.js";

export const createWorkspace = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Workspace name is required",
      });
    }

    const workspace = await Workspace.create({
      name: name.trim(),
      owner: req.user._id,
      members: [{ user: req.user._id, role: "owner" }],
    });

    return res.status(201).json({
      success: true,
      data: workspace,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyWorkspaces = async (req, res, next) => {
  try {
    const workspaces = await Workspace.find({
      "members.user": req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: workspaces.length,
      data: workspaces,
    });
  } catch (error) {
    next(error);
  }
};

export const getWorkspaceById = async (req, res, next) => {
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

    return res.status(200).json({
      success: true,
      data: access.workspace,
    });
  } catch (error) {
    next(error);
  }
};
