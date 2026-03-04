import express, { Application } from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { json, urlencoded } from "body-parser";
import { rateLimiterMiddleware } from "./middleware/rateLimiter";
import { errorHandler } from "./middleware/errorHandler";
import { authRouter } from "./routes/authRoutes";
import { generationRouter } from "./routes/generationRoutes";
import { jobsRouter } from "./routes/jobsRoutes";
import { subscriptionRouter } from "./routes/subscriptionRoutes";
import { webhookRouter } from "./routes/webhookRoutes";
import { validateEnv } from "./lib/env";

validateEnv();

export const createApp = (): Application => {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || "http://localhost:5173",
      credentials: true,
    })
  );
  app.use(morgan("combined"));
  app.use(cookieParser());
  app.use(json({ limit: "1mb" }));
  app.use(urlencoded({ extended: true }));

  app.use("/api/v1/auth", rateLimiterMiddleware, authRouter);
  app.use("/api/v1/generation", generationRouter);
  app.use("/api/v1/jobs", jobsRouter);
  app.use("/api/v1/subscription", subscriptionRouter);
  app.use("/api/v1/webhooks", webhookRouter);

  app.use(errorHandler);

  return app;
};

