import mongoose from "mongoose";
import Board from "../models/Board.js";
import Task from "../models/Task.js";
import Workspace from "../models/Workspace.js";

const notFound = () => ({ status: 404 });
const forbidden = () => ({ status: 403 });

const findMembership = (workspace, userId) =>
  workspace.members.find((member) => member.user.equals(userId));

export const getWorkspaceAccess = async (workspaceId, userId) => {
  if (!mongoose.isValidObjectId(workspaceId)) {
    return notFound();
  }

  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    return notFound();
  }

  const membership = findMembership(workspace, userId);
  if (!membership) {
    return forbidden();
  }

  return { workspace, membership };
};

export const getBoardAccess = async (boardId, userId) => {
  if (!mongoose.isValidObjectId(boardId)) {
    return notFound();
  }

  const board = await Board.findById(boardId).populate("workspace");
  if (!board || !board.workspace) {
    return notFound();
  }

  const membership = findMembership(board.workspace, userId);
  if (!membership) {
    return forbidden();
  }

  return { board, workspace: board.workspace, membership };
};

export const getTaskAccess = async (taskId, userId) => {
  if (!mongoose.isValidObjectId(taskId)) {
    return notFound();
  }

  const task = await Task.findById(taskId).populate({
    path: "board",
    populate: { path: "workspace" },
  });

  if (!task || !task.board || !task.board.workspace) {
    return notFound();
  }

  const membership = findMembership(task.board.workspace, userId);
  if (!membership) {
    return forbidden();
  }

  return {
    task,
    board: task.board,
    workspace: task.board.workspace,
    membership,
  };
};
