import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Single-admin session: one password from ADMIN_PASSWORD, an HttpOnly cookie
 * holding an HMAC token. Changing the password invalidates all sessions.
 */
export const ADMIN_COOKIE = "inertia_admin";
const SESSION_PAYLOAD = "inertia-admin-session-v1";
const MAX_AGE = 60 * 60 * 24 * 7;

export function isAdminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD);
}

function sessionToken() {
  return createHmac("sha256", process.env.ADMIN_PASSWORD ?? "")
    .update(SESSION_PAYLOAD)
    .digest("hex");
}

function safeEqual(a, b) {
  const left = createHash("sha256").update(a).digest();
  const right = createHash("sha256").update(b).digest();
  return timingSafeEqual(left, right);
}

export function verifyPassword(candidate) {
  if (!isAdminConfigured() || typeof candidate !== "string") return false;
  return safeEqual(candidate, process.env.ADMIN_PASSWORD);
}

export async function isAdmin() {
  if (!isAdminConfigured()) return false;
  const store = await cookies();
  const value = store.get(ADMIN_COOKIE)?.value;
  return typeof value === "string" && safeEqual(value, sessionToken());
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  };
}

export function createSessionCookie() {
  return { name: ADMIN_COOKIE, value: sessionToken(), options: sessionCookieOptions() };
}
