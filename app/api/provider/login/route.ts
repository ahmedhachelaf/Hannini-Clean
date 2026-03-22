import { NextResponse } from "next/server";
import { authenticateProviderAccess, setProviderSessionCookie } from "@/lib/provider-auth";

export async function POST(request: Request) {
  try {
    const payload = (await request.json().catch(() => null)) as
      | {
          phoneOrWhatsapp?: string;
          token?: string;
        }
      | null;

    if (!payload?.phoneOrWhatsapp?.trim() || !payload?.token?.trim()) {
      return NextResponse.json({ ok: false, message: "Missing phone or access code." }, { status: 400 });
    }

    const provider = await authenticateProviderAccess(payload.phoneOrWhatsapp, payload.token);

    if (!provider || !provider.verification.managementToken) {
      return NextResponse.json({ ok: false, message: "Invalid provider access." }, { status: 401 });
    }

    await setProviderSessionCookie({
      providerId: provider.id,
      token: provider.verification.managementToken,
    });

    return NextResponse.json({
      ok: true,
      redirectTo: `/${request.headers.get("x-hannini-locale") === "fr" ? "fr" : "ar"}/provider`,
    });
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
