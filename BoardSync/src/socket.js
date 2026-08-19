import { Server } from "socket.io";
import { getBoardAccess } from "./utils/access.js";
import { getUserFromToken } from "./utils/auth.js";

const getSocketToken = (socket) => {
  const token =
    socket.handshake.auth?.token || socket.handshake.headers.authorization;

  if (typeof token !== "string") {
    return null;
  }

  return token.startsWith("Bearer ") ? token.slice(7) : token;
};

const sendJoinResponse = (acknowledgment, response) => {
  if (typeof acknowledgment === "function") {
    acknowledgment(response);
  }
};

export const setupSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.ALLOWED_ORIGIN || "*",
    },
  });

  io.use(async (socket, next) => {
    const token = getSocketToken(socket);

    if (!token) {
      return next(new Error("Not authorized, no token provided"));
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return next(new Error("Not authorized, token failed"));
    }

    socket.user = user;
    next();
  });

  io.on("connection", (socket) => {
    socket.on("joinBoard", async (boardId, acknowledgment) => {
      try {
        const access = await getBoardAccess(boardId, socket.user._id);

        if (access.status) {
          sendJoinResponse(acknowledgment, {
            success: false,
            status: access.status,
            message:
              access.status === 404
                ? "Board not found"
                : "You are not a member of this workspace",
          });
          return;
        }

        const room = String(access.board._id);
        await socket.join(room);
        sendJoinResponse(acknowledgment, {
          success: true,
          boardId: room,
        });
      } catch (error) {
        sendJoinResponse(acknowledgment, {
          success: false,
          status: 500,
          message: "Unable to join board room",
        });
      }
    });
  });

  return io;
};
