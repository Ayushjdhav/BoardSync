import { Router } from "express";
import { getUsers } from "../controllers/user.controller.js";

const router = Router();

// GET /api/users
router.get("/users", getUsers);

export default router;
