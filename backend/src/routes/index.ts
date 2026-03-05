import { Router } from "express";
import authRoutes from "./auth.routes";
import brandRoutes from "./brand.routes";
import subscriptionRoutes from "./subscription.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/brand", brandRoutes);
router.use("/subscription", subscriptionRoutes);

export default router;

