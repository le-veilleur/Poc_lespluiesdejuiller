import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import type { JwtPayload } from "@/types";

const JWT_SECRET = process.env.JWT_SECRET!;
const SALT_ROUNDS = 10;

// --- Hachage du mot de passe ---

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}
// --- Comparaison du mot de passe ---
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// --- Gestion des tokens JWT ---

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

// --- Extraction du token depuis le cookie header ---

export function getTokenFromHeaders(headers: Headers): string | null {
  const cookieHeader = headers.get("Cookie");
  if (!cookieHeader) return null;

  const match = cookieHeader.match(/(?:^|;\s*)token=([^;]*)/);
  return match?.[1] ?? null;
}

// --- Helper : verifier l'auth et retourner le payload ---

export function authenticateRequest(headers: Headers): JwtPayload | null {
  const token = getTokenFromHeaders(headers);
  if (!token) return null;

  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}
