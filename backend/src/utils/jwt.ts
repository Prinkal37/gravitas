import jwt from "jsonwebtoken";

type AccessTokenPayload = {
  userId: string;
  sessionId: string;
};

const getJwtConfig = () => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN;

  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }

  if (!expiresIn) {
    throw new Error("JWT_EXPIRES_IN is not set");
  }

  return {
    secret,
    expiresIn: expiresIn as jwt.SignOptions["expiresIn"],
  };
};

export const generateAccessToken = (
  userId: string,
  sessionId: string
): string => {
  const { secret, expiresIn } = getJwtConfig();

  const payload: AccessTokenPayload = {
    userId,
    sessionId,
  };

  return jwt.sign(payload, secret, {
    expiresIn,
    algorithm: "HS256",
  });
};

export const verifyAccessToken = (
  token: string
): AccessTokenPayload => {
  const { secret } = getJwtConfig();

  const decoded = jwt.verify(token, secret, {
    algorithms: ["HS256"],
  });

  if (typeof decoded === "string") {
    throw new Error("Invalid token payload");
  }

  const payload = decoded as AccessTokenPayload;

  if (!payload.userId || !payload.sessionId) {
    throw new Error("Invalid token payload");
  }

  return payload;
};