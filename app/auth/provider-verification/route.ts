import { NextRequest, NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { getAppBaseUrl } from "@/lib/app-origin";
import {
  clearPendingProviderVerification,
  createAnonSupabaseClient,
  setVerifiedProviderContact,
  type ProviderVerificationMethod,
} from "@/lib/provider-contact-verification";

const VALID_EMAIL_TYPES = new Set([
  "signup",
  "email",
  "magiclink",
  "invite",
  "recovery",
  "email_change",
  "email_change_current",
  "email_change_new",
]);

function redirectToJoin(locale: "ar" | "fr", status: "success" | "error", method?: ProviderVerificationMethod, target?: string) {
  const url = new URL(`/${locale}/join`, getAppBaseUrl());
  url.searchParams.set("verification", status === "success" ? "email-success" : "email-error");
  if (method) {
    url.searchParams.set("verifiedMethod", method);
  }
  if (target) {
    url.searchParams.set("verifiedTarget", target);
  }
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  console.log("[HANNINI DEBUG] Function called:", "provider-verification:callback", new Date().toISOString());
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") === "fr" ? "fr" : "ar";
  const tokenHash = searchParams.get("token_hash");
  const rawType = searchParams.get("type");

  if (!tokenHash || !rawType || !VALID_EMAIL_TYPES.has(rawType)) {
    return redirectToJoin(locale, "error");
  }

  const supabase = createAnonSupabaseClient();
  if (!supabase) {
    return redirectToJoin(locale, "error");
  }

  console.log("[HANNINI DEBUG] Supabase call:", {
    table: "auth",
    operation: "verifyOtp",
    payload_keys: ["token_hash", "type"],
  });

  const verifyResult = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: rawType as EmailOtpType,
  });

  console.log("[HANNINI DEBUG] Supabase result:", {
    error: verifyResult.error?.message,
    error_code: verifyResult.error?.code,
    error_details: verifyResult.error?.message,
    data_received: Boolean(verifyResult.data.user?.id),
  });

  if (verifyResult.error || !verifyResult.data.user?.id) {
    console.error("provider-verification:email_callback_failed", {
      locale,
      type: rawType,
      error: verifyResult.error,
    });
    return redirectToJoin(locale, "error");
  }

  const user = verifyResult.data.user;
  const method: ProviderVerificationMethod = user.email ? "email" : "phone";
  const target = (user.email ?? user.phone ?? "").trim().toLowerCase();

  if (!target) {
    return redirectToJoin(locale, "error");
  }

  await setVerifiedProviderContact({
    method,
    target,
    authUserId: user.id,
  });
  await clearPendingProviderVerification();

  return redirectToJoin(locale, "success", method, target);
}
