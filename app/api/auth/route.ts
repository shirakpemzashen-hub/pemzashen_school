import { NextRequest, NextResponse } from "next/server";
import { createAdminSession } from "../admin-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

type AttemptRecord = { count: number; resetAt: number };
const attempts = new Map<string, AttemptRecord>();

function clientKey(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function remainingBlockSeconds(key: string) {
  const record = attempts.get(key);
  if (!record) return 0;
  if (record.resetAt <= Date.now()) {
    attempts.delete(key);
    return 0;
  }
  return record.count >= MAX_ATTEMPTS ? Math.ceil((record.resetAt - Date.now()) / 1000) : 0;
}

function registerFailure(key: string) {
  const existing = attempts.get(key);
  const now = Date.now();
  if (!existing || existing.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }
  existing.count += 1;
}

// POST — մուտք
export async function POST(request: NextRequest) {
  const key = clientKey(request);
  const retryAfter = remainingBlockSeconds(key);
  if (retryAfter) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  let token: string | undefined;
  try {
    ({ token } = (await request.json()) as { token?: string });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken || !token || token !== adminToken) {
    registerFailure(key);
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  attempts.delete(key);
  const response = NextResponse.json({ ok: true });
  response.cookies.set("admin_session", createAdminSession(adminToken), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return response;
}

// DELETE — ելք
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete("admin_session");
  return response;
}
