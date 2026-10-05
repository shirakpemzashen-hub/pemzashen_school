import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isAdminSession } from "./admin-session";

/**
 * Returns a 401 response if the request is not authenticated,
 * or null if auth is valid.
 */
export async function requireAuth(): Promise<NextResponse | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  const token = process.env.ADMIN_TOKEN;
  if (!isAdminSession(session, token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
