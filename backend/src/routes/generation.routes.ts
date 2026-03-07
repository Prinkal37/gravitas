import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import {
  createQuickPost,
  createRepurpose,
  getGenerationJobs,
  getGenerationJobDetail,
} from "../controllers/generation.controller";

const router = Router();

router.post("/quick", authenticate, createQuickPost);
router.post("/repurpose", authenticate, createRepurpose);
router.get("/jobs", authenticate, getGenerationJobs);
router.get("/jobs/:jobId", authenticate, getGenerationJobDetail);

export default router;
