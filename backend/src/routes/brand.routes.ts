import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import {
  createBrandProfile,
  updateBrandProfile,
  getBrandProfile,
} from "../controllers/brand.controller";

const router = Router();

router.post("/", authenticate, createBrandProfile);
router.put("/", authenticate, updateBrandProfile);
router.get("/", authenticate, getBrandProfile);

export default router;

