import { NextResponse } from "next/server";
import { clearProviderSessionCookie } from "@/lib/provider-auth";

export async function POST() {
  await clearProviderSessionCookie();
  return NextResponse.json({ ok: true });
}
