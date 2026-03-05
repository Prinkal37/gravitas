import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import {
  createSubscription,
  cancelSubscription,
  getSubscriptionStatus,
} from "../controllers/subscription.controller";

const router = Router();

router.post("/create", authenticate, createSubscription);
router.post("/cancel", authenticate, cancelSubscription);
router.get("/status", authenticate, getSubscriptionStatus);

export default router;

