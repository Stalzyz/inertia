import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import {
  createSessionCookie,
  isAdminConfigured,
  verifyPassword,
} from "@/lib/admin-auth";

const attempts = new Map();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 6;

function clientKey(headerList) {
  return (
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip") ||
    "local"
  );
}

function rateLimited(key) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

function clearAttempts(key) {
  attempts.delete(key);
}

export async function POST(request) {
  const headerList = await headers();
  const key = clientKey(headerList);

  if (rateLimited(key)) {
    return NextResponse.json(
      { error: "Too many attempts. Try again in a few minutes." },
      { status: 429 }
    );
  }

  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "Admin password is not configured on the server." },
      { status: 503 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!verifyPassword(body?.password)) {
    return NextResponse.json(
      { error: "That password is not correct." },
      { status: 401 }
    );
  }

  clearAttempts(key);
  const session = createSessionCookie();
  const store = await cookies();
  store.set(session.name, session.value, session.options);
  return NextResponse.json({ ok: true });
}
