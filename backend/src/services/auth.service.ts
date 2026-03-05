import { prisma } from "../lib/prisma";
import { hashPassword, verifyPassword } from "../utils/password";
import { generateAccessToken } from "../utils/jwt";
import type { User } from "@prisma/client";

type AuthUser = Pick<User, "id" | "email" | "role" | "createdAt" | "updatedAt">;

type RegisterParams = {
  email: string;
  password: string;
};

type LoginParams = {
  email: string;
  password: string;
};

type RegisterResult = {
  accessToken: string;
  user: AuthUser;
  sessionId: string;
};

type LoginResult = {
  accessToken: string;
  user: AuthUser;
  sessionId: string;
};

export const register = async ({
  email,
  password,
}: RegisterParams): Promise<RegisterResult> => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
    },
  });

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      expiresAt,
      // Placeholder values for fields not yet used in auth flows
      refreshTokenHash: "",
      ipAddress: "",
      userAgent: "",
    },
  });

  const accessToken = generateAccessToken(user.id, session.id);

  const { id, email: userEmail, role, createdAt, updatedAt } = user;

  return {
    accessToken,
    user: {
      id,
      email: userEmail,
      role,
      createdAt,
      updatedAt,
    },
    sessionId: session.id,
  };
};

export const login = async ({
  email,
  password,
}: LoginParams): Promise<LoginResult> => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isValidPassword = await verifyPassword(password, user.passwordHash);

  if (!isValidPassword) {
    throw new Error("Invalid email or password");
  }

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      expiresAt,
      refreshTokenHash: "",
      ipAddress: "",
      userAgent: "",
    },
  });

  const accessToken = generateAccessToken(user.id, session.id);

  const { id, email: userEmail, role, createdAt, updatedAt } = user;

  return {
    accessToken,
    user: {
      id,
      email: userEmail,
      role,
      createdAt,
      updatedAt,
    },
    sessionId: session.id,
  };
};

export const logout = async (sessionId: string): Promise<void> => {
  await prisma.session.deleteMany({
    where: { id: sessionId },
  });
};

export const getCurrentUser = async (userId: string): Promise<AuthUser | null> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
};

