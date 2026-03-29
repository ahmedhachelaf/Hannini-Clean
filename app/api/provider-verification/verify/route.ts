import { NextResponse } from "next/server";
import {
  clearPendingProviderVerification,
  createAnonSupabaseClient,
  getEmailVerificationMode,
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
  try {
    const payload = (await request.json().catch(() => null)) as VerifyPayload | null;
    const locale = payload?.locale === "fr" ? "fr" : "ar";
    const method = payload?.method === "phone" ? "phone" : "email";
    const rawTarget = String(payload?.target ?? "");
    const target = normalizeVerificationTarget(method, rawTarget);
    const code = String(payload?.code ?? "").trim();
    const constants = getVerificationConstants();
    getEmailVerificationMode();

    if (!validateVerificationTarget(method, rawTarget) || !/^\d{6}$/.test(code)) {
      return NextResponse.json(
        {
          ok: false,
          message:
            locale === "ar"
              ? "أدخل رمزاً صحيحاً من 6 أرقام مع وسيلة تحقق صحيحة."
              : "Saisissez un code valide à 6 chiffres avec une cible de vérification correcte.",
        },
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
                ? "خدمة التحقق غير مهيأة حالياً. أضف مفاتيح Supabase Auth إلى Vercel أولاً."
                : "Le service de vérification n'est pas configuré pour le moment. Ajoutez d'abord les variables Supabase Auth dans Vercel.",
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
        channel: pending.channel,
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

    console.log("[HANNINI DEBUG] Supabase call:", {
      table: "auth",
      operation: "verifyOtp",
      payload_keys: method === "phone" ? ["phone", "token", "type"] : ["email", "token", "type"],
    });

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

    console.log("[HANNINI DEBUG] Supabase result:", {
      error: verifyResult.error?.message,
      error_code: verifyResult.error?.code,
      error_details: verifyResult.error?.message,
      data_received: Boolean(verifyResult.data?.user?.id),
    });

    if (verifyResult.error || !verifyResult.data.user?.id) {
      console.error("provider-verification:verify_failed", {
        method,
        target,
        channel: pending.channel,
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

      const normalizedError = verifyResult.error?.message?.toLowerCase() ?? "";
      const message = normalizedError.includes("expired")
        ? getVerificationErrorMessage("expired", locale)
        : normalizedError.includes("invalid") || normalizedError.includes("token")
          ? locale === "ar"
            ? "الرمز غير صحيح. تحقق من الرمز ثم حاول مرة أخرى."
            : "Le code est incorrect. Vérifiez-le puis réessayez."
          : locale === "ar"
            ? "تعذر التحقق من الرمز حالياً. إذا استمر الخطأ راجع إعدادات Supabase Auth."
            : "Impossible de vérifier le code pour le moment. Si le problème persiste, vérifiez la configuration Supabase Auth.";

      return NextResponse.json(
        {
          ok: false,
          message,
          attemptsRemaining: Math.max(0, constants.maxAttempts - nextAttempts),
        },
        { status: 400 },
      );
    }

    const verified = await setVerifiedProviderContact({
      method,
      target,
      channel: pending.channel,
      authUserId: verifyResult.data.user.id,
    });

    await clearPendingProviderVerification();

    return NextResponse.json({
      ok: true,
      verified,
      message:
        locale === "ar" ? "تم التحقق بنجاح. يمكنك الآن إرسال طلبك." : "Vérification réussie. Vous pouvez maintenant envoyer votre demande.",
    });
  } catch (error) {
    console.error("[HANNINI DEBUG] Caught error:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : "UnknownError",
    });

    return NextResponse.json(
      {
        ok: false,
        message:
          "تعذر التحقق من الرمز حالياً. راجع سجلات الخادم وإعدادات Supabase Auth ثم حاول مجدداً.",
      },
      { status: 500 },
    );
  }
}
