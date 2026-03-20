import { NextResponse } from "next/server";
import { adminLoginSchema } from "@/lib/validation";
import { setAdminSessionCookie } from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
    const payload = adminLoginSchema.parse(await request.json());
    const expectedPassword = process.env.ADMIN_ACCESS_PASSWORD;

    if (!expectedPassword) {
      return NextResponse.json({ ok: false, message: "ADMIN_ACCESS_PASSWORD is not configured." }, { status: 500 });
    }

    if (payload.password !== expectedPassword) {
      return NextResponse.json({ ok: false, message: "Invalid password." }, { status: 401 });
    }

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
