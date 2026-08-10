import bcrypt from "bcryptjs";

const ROUNDS = 12;

/** Hash a plaintext password with bcrypt. */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, ROUNDS);
}

/** Compare a candidate password against a stored bcrypt hash. */
export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/** Very light password policy — 8+ chars, at least one letter and one digit. */
export function validatePassword(pw: string): { ok: true } | { ok: false; reason: string } {
  if (typeof pw !== "string") return { ok: false, reason: "Password is required." };
  if (pw.length < 8) return { ok: false, reason: "Password must be at least 8 characters." };
  if (!/[A-Za-z]/.test(pw)) return { ok: false, reason: "Password must contain a letter." };
  if (!/[0-9]/.test(pw)) return { ok: false, reason: "Password must contain a digit." };
  return { ok: true };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function normalizeEmail(v: unknown): string {
  return String(v ?? "").trim().toLowerCase();
}
export function validateEmail(v: string): { ok: true } | { ok: false; reason: string } {
  if (!v) return { ok: false, reason: "Email is required." };
  if (v.length > 254) return { ok: false, reason: "Email is too long." };
  if (!EMAIL_RE.test(v)) return { ok: false, reason: "Enter a valid email address." };
  return { ok: true };
}
