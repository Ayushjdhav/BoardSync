import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const getUserFromToken = async (token) => {
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return await User.findById(decoded.id);
  } catch (error) {
    return null;
  }
};
