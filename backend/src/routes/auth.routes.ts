import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import {
  register,
  login,
  logout,
  getCurrentUser,
} from "../controllers/auth.controller";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", authenticate, logout);
router.get("/me", authenticate, getCurrentUser);

export default router;

