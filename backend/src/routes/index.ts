import { Router } from "express";
import authRoutes from "./auth.routes";
import brandRoutes from "./brand.routes";
import subscriptionRoutes from "./subscription.routes";
import webhookRoutes from "./webhook.routes";
import generationRoutes from "./generation.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/brand", brandRoutes);
router.use("/subscription", subscriptionRoutes);
router.use("/webhooks", webhookRoutes);
router.use("/generation", generationRoutes);

export default router;

