import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    env: {
      NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      NEXT_PUBLIC_APP_URL: Boolean(process.env.NEXT_PUBLIC_APP_URL),
      ADMIN_ACCESS_PASSWORD: Boolean(process.env.ADMIN_ACCESS_PASSWORD),
      PROVIDER_PHONE_OTP_ENABLED: Boolean(process.env.PROVIDER_PHONE_OTP_ENABLED || process.env.NEXT_PUBLIC_PROVIDER_PHONE_OTP_ENABLED),
      PROVIDER_PHONE_OTP_WHATSAPP_ENABLED: Boolean(
        process.env.PROVIDER_PHONE_OTP_WHATSAPP_ENABLED || process.env.NEXT_PUBLIC_PROVIDER_PHONE_OTP_WHATSAPP_ENABLED,
      ),
    },
  });
}
