import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const ADMIN_COOKIE = "henini_admin_session";

/**
 * Derives a session token from the admin password using HMAC-SHA256.
 * The raw password is never stored in the cookie — only its digest.
 */
function createAdminSessionToken(password: string): string {
  return createHmac("sha256", password).update("hannini-admin-session-v1").digest("hex");
}

export async function isAdminAuthenticated() {
  const store = await cookies();
  const cookieValue = store.get(ADMIN_COOKIE)?.value;
  const expected = process.env.ADMIN_ACCESS_PASSWORD;

  if (!expected || !cookieValue) {
    return false;
  }

  const expectedToken = createAdminSessionToken(expected);

  if (expectedToken.length !== cookieValue.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(expectedToken), Buffer.from(cookieValue));
}

export async function setAdminSessionCookie() {
  const expected = process.env.ADMIN_ACCESS_PASSWORD;

  if (!expected) {
    throw new Error("ADMIN_ACCESS_PASSWORD is not configured.");
  }

  const store = await cookies();
  store.set(ADMIN_COOKIE, createAdminSessionToken(expected), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function clearAdminSessionCookie() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}
