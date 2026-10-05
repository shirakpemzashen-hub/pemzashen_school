import { createHmac, timingSafeEqual } from "node:crypto";

const SESSION_DURATION_SECONDS = 60 * 60 * 8;

function signature(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createAdminSession(secret: string) {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS;
  const payload = String(expiresAt);
  return `${payload}.${signature(payload, secret)}`;
}

export function isAdminSession(session: string | undefined, secret: string | undefined) {
  if (!session || !secret) return false;

  const [expiresAt, providedSignature, ...extra] = session.split(".");
  if (!expiresAt || !providedSignature || extra.length > 0 || !/^\d+$/.test(expiresAt)) return false;
  if (Number(expiresAt) < Math.floor(Date.now() / 1000)) return false;

  const expectedSignature = signature(expiresAt, secret);
  const expected = Buffer.from(expectedSignature);
  const provided = Buffer.from(providedSignature);
  return expected.length === provided.length && timingSafeEqual(expected, provided);
}
