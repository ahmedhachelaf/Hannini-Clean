import { NextResponse } from "next/server";
import {
  getEmailVerificationMode,
  getEnabledPhoneVerificationChannels,
  getPendingProviderVerification,
  getVerifiedProviderContact,
  isPhoneVerificationEnabled,
} from "@/lib/provider-contact-verification";

export async function GET() {
  console.log("[HANNINI DEBUG] Function called:", "provider-verification:status", new Date().toISOString());
  const [pending, verified] = await Promise.all([
    getPendingProviderVerification(),
    getVerifiedProviderContact(),
  ]);

  return NextResponse.json({
    ok: true,
    pending,
    verified,
    phoneOtpEnabled: isPhoneVerificationEnabled(),
    enabledPhoneChannels: getEnabledPhoneVerificationChannels(),
    emailVerificationMode: getEmailVerificationMode(),
  });
}
