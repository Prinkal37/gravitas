import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../lib/env";

export interface AuthPayload {
  sub: string;
  role: "USER" | "ADMIN";
}

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthPayload;
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      data: {},
      error: "Unauthorized",
    });
  }

  const token = authHeader.substring("Bearer ".length);

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthPayload & {
      exp: number;
      iat: number;
    };

    req.user = {
      sub: decoded.sub,
      role: decoded.role,
    };

    return next();
  } catch {
    return res.status(401).json({
      success: false,
      data: {},
      error: "Invalid token",
    });
  }
};

