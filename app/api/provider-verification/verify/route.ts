import { NextResponse } from "next/server";
import {
  clearPendingProviderVerification,
  createAnonSupabaseClient,
  getPendingProviderVerification,
  getVerificationConstants,
  getVerificationErrorMessage,
  normalizeVerificationTarget,
  setVerifiedProviderContact,
  updatePendingProviderVerificationAttempts,
  validateVerificationTarget,
  type ProviderVerificationMethod,
} from "@/lib/provider-contact-verification";

type VerifyPayload = {
  locale?: string;
  method?: ProviderVerificationMethod;
  target?: string;
  code?: string;
};

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as VerifyPayload | null;
  const locale = payload?.locale === "fr" ? "fr" : "ar";
  const method = payload?.method === "phone" ? "phone" : "email";
  const rawTarget = String(payload?.target ?? "");
  const target = normalizeVerificationTarget(method, rawTarget);
  const code = String(payload?.code ?? "").trim();
  const constants = getVerificationConstants();

  if (!validateVerificationTarget(method, rawTarget) || !/^\d{6}$/.test(code)) {
    return NextResponse.json(
      { ok: false, message: getVerificationErrorMessage("invalid_target", locale) },
      { status: 400 },
    );
  }

  const pending = await getPendingProviderVerification();
  if (!pending || pending.method !== method || pending.target !== target) {
    return NextResponse.json(
      { ok: false, message: getVerificationErrorMessage("missing_pending", locale) },
      { status: 400 },
    );
  }

  if (Date.parse(pending.expiresAt) <= Date.now()) {
    await clearPendingProviderVerification();
    return NextResponse.json(
      { ok: false, message: getVerificationErrorMessage("expired", locale) },
      { status: 400 },
    );
  }

  if (pending.attempts >= constants.maxAttempts) {
    await clearPendingProviderVerification();
    return NextResponse.json(
      { ok: false, message: getVerificationErrorMessage("locked", locale) },
      { status: 429 },
    );
  }

  const supabase = createAnonSupabaseClient();

  if (!supabase) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        {
          ok: false,
          message:
            locale === "ar"
              ? "خدمة التحقق غير مهيأة حالياً. فعّل إعدادات Supabase Auth أولاً."
              : "Le service de vérification n'est pas configuré pour le moment. Activez d'abord Supabase Auth.",
        },
        { status: 503 },
      );
    }

    if (code !== "111111") {
      const nextAttempts = pending.attempts + 1;
      await updatePendingProviderVerificationAttempts(nextAttempts);
      return NextResponse.json(
        {
          ok: false,
          message:
            nextAttempts >= constants.maxAttempts
              ? getVerificationErrorMessage("locked", locale)
              : locale === "ar"
                ? "الرمز غير صحيح. حاول مرة أخرى."
                : "Code incorrect. Réessayez.",
          attemptsRemaining: Math.max(0, constants.maxAttempts - nextAttempts),
        },
        { status: nextAttempts >= constants.maxAttempts ? 429 : 400 },
      );
    }

    const verified = await setVerifiedProviderContact({
      method,
      target,
      authUserId: `demo-${method}-${target}`,
    });

    await clearPendingProviderVerification();

    return NextResponse.json({
      ok: true,
      demoMode: true,
      verified,
      message:
        locale === "ar" ? "تم التحقق بنجاح. يمكنك الآن إرسال طلبك." : "Vérification réussie. Vous pouvez maintenant envoyer votre demande.",
    });
  }

  const verifyResult =
    method === "phone"
      ? await supabase.auth.verifyOtp({
          phone: target,
          token: code,
          type: "sms",
        })
      : await supabase.auth.verifyOtp({
          email: target,
          token: code,
          type: "email",
        });

  if (verifyResult.error || !verifyResult.data.user?.id) {
    console.error("provider-verification:verify_failed", {
      method,
      target,
      error: verifyResult.error,
    });

    const nextAttempts = pending.attempts + 1;
    if (nextAttempts >= constants.maxAttempts) {
      await clearPendingProviderVerification();
      return NextResponse.json(
        { ok: false, message: getVerificationErrorMessage("locked", locale), attemptsRemaining: 0 },
        { status: 429 },
      );
    }

    await updatePendingProviderVerificationAttempts(nextAttempts);

    return NextResponse.json(
      {
        ok: false,
        message:
          locale === "ar"
            ? "الرمز غير صحيح أو انتهت صلاحيته. تحقق منه ثم حاول مرة أخرى."
            : "Le code est incorrect ou expiré. Vérifiez-le puis réessayez.",
        attemptsRemaining: Math.max(0, constants.maxAttempts - nextAttempts),
      },
      { status: 400 },
    );
  }

  const verified = await setVerifiedProviderContact({
    method,
    target,
    authUserId: verifyResult.data.user.id,
  });

  await clearPendingProviderVerification();

  return NextResponse.json({
    ok: true,
    verified,
    message:
      locale === "ar" ? "تم التحقق بنجاح. يمكنك الآن إرسال طلبك." : "Vérification réussie. Vous pouvez maintenant envoyer votre demande.",
  });
}
