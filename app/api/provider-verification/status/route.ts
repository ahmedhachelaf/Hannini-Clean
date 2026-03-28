import { NextResponse } from "next/server";
import {
  getEmailVerificationMode,
  getEnabledPhoneVerificationChannels,
  getPendingProviderVerification,
  getVerifiedProviderContact,
  isPhoneVerificationEnabled,
} from "@/lib/provider-contact-verification";

export async function GET() {
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
