import express, { Application } from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { json, urlencoded } from "body-parser";
import { errorHandler } from "./middleware/errorHandler";
import routes from "./routes";
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

  app.use("/api", routes);

  app.use(errorHandler);

  return app;
};

