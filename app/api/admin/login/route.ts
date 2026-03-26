import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { setAdminSessionCookie } from "@/lib/admin-auth";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit";
import { adminLoginSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    // Rate-limit by IP address
    const headerStore = await headers();
    const ip =
      headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      headerStore.get("x-real-ip") ??
      "unknown";

    const { allowed, retryAfterSeconds } = checkRateLimit(`admin-login:${ip}`);

    if (!allowed) {
      return NextResponse.json(
        { ok: false, message: "Too many attempts. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(retryAfterSeconds) },
        },
      );
    }

    const payload = adminLoginSchema.parse(await request.json());
    const expectedPassword = process.env.ADMIN_ACCESS_PASSWORD;

    if (!expectedPassword) {
      return NextResponse.json({ ok: false, message: "ADMIN_ACCESS_PASSWORD is not configured." }, { status: 500 });
    }

    if (payload.password !== expectedPassword) {
      return NextResponse.json({ ok: false, message: "Invalid password." }, { status: 401 });
    }

    // Login successful — clear rate limit for this IP
    resetRateLimit(`admin-login:${ip}`);

    await setAdminSessionCookie();

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Unable to log in.",
      },
      { status: 400 },
    );
  }
}
