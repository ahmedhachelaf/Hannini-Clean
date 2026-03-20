import { cookies } from "next/headers";

const ADMIN_COOKIE = "henini_admin_session";

export async function isAdminAuthenticated() {
  const store = await cookies();
  const cookieValue = store.get(ADMIN_COOKIE)?.value;
  const expected = process.env.ADMIN_ACCESS_PASSWORD;

  if (!expected) {
    return false;
  }

  return cookieValue === expected;
}

export async function setAdminSessionCookie() {
  const expected = process.env.ADMIN_ACCESS_PASSWORD;

  if (!expected) {
    throw new Error("ADMIN_ACCESS_PASSWORD is not configured.");
  }

  const store = await cookies();
  store.set(ADMIN_COOKIE, expected, {
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
