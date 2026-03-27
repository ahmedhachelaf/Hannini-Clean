import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import {
  authenticateProviderWithAccessCode,
  authenticateProviderWithPassword,
  findProviderByIdentifier,
  setProviderSessionCookie,
} from "@/lib/provider-auth";
import { createServerSupabaseClient, hasSupabaseServerEnv } from "@/lib/supabase/server";
import { getProviderById } from "@/lib/repository";

function createAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function POST(request: Request) {
  try {
    const locale = request.headers.get("x-hannini-locale") === "fr" ? "fr" : "ar";
    const payload = (await request.json().catch(() => null)) as
      | {
          identifier?: string;
          phoneOrWhatsapp?: string;
          password?: string;
          accessCode?: string;
        }
      | null;

    const identifier = payload?.identifier?.trim() || payload?.phoneOrWhatsapp?.trim() || "";

    if (!identifier || (!payload?.password?.trim() && !payload?.accessCode?.trim())) {
      return NextResponse.json(
        {
          ok: false,
          message:
            locale === "ar"
              ? "أدخل البريد الإلكتروني أو رقم الهاتف مع كلمة المرور أو رمز الوصول الاحتياطي."
              : "Saisissez votre e-mail ou téléphone avec le mot de passe, ou le code d'accès de secours.",
        },
        { status: 400 },
      );
    }

    const identifierLower = identifier.toLowerCase();
    const isEmailLike = identifier.includes("@");
    let provider = null;

    if (isEmailLike && payload.password?.trim() && hasSupabaseServerEnv()) {
      const anonClient = createAnonClient();
      const serviceClient = createServerSupabaseClient();

      if (anonClient && serviceClient) {
        const { data: authData, error: authError } = await anonClient.auth.signInWithPassword({
          email: identifierLower,
          password: payload.password.trim(),
        });

        if (authError) {
          console.warn("[provider/login] Supabase Auth signIn failed:", authError.message);
        } else if (authData.user?.id) {
          const { data: providerRow } = await serviceClient
            .from("providers")
            .select("id")
            .eq("auth_user_id", authData.user.id)
            .single();

          if (providerRow?.id) {
            provider = await getProviderById(providerRow.id, true);
          }
        }
      }
    }

    if (!provider && payload.password?.trim()) {
      provider = await authenticateProviderWithPassword(identifier, payload.password.trim());
    }

    if (!provider && payload.accessCode?.trim()) {
      provider = await authenticateProviderWithAccessCode(identifier, payload.accessCode.trim());
    }

    if (!provider) {
      const matched = await findProviderByIdentifier(identifier);
      let failMessage: string;

      if (!matched) {
        failMessage =
          locale === "ar"
            ? "لا يوجد حساب بهذا البريد الإلكتروني أو الرقم. هل تريد التسجيل كمزوّد خدمة؟"
            : "Aucun compte trouvé avec cet e-mail ou ce numéro. Souhaitez-vous vous inscrire ?";
      } else if (["submitted", "under_review", "pending", "needs_more_info"].includes(matched.status)) {
        failMessage =
          locale === "ar"
            ? "طلبك قيد المراجعة. سنتواصل معك قريباً بعد الموافقة على ملفك."
            : "Votre dossier est en cours d'examen. Nous vous contacterons après validation de votre profil.";
      } else if (matched.status === "rejected") {
        failMessage =
          locale === "ar"
            ? "لم تتم الموافقة على طلبك. تواصل معنا لمزيد من المعلومات."
            : "Votre candidature n'a pas été retenue. Contactez-nous pour plus d'informations.";
      } else {
        failMessage =
          locale === "ar"
            ? "البريد الإلكتروني أو كلمة المرور غير صحيحة. تأكد من البيانات وحاول مجدداً."
            : "E-mail ou mot de passe incorrect. Vérifiez vos identifiants et réessayez.";
      }

      return NextResponse.json({ ok: false, message: failMessage }, { status: 401 });
    }

    if (["submitted", "under_review", "pending", "needs_more_info"].includes(provider.status)) {
      return NextResponse.json(
        {
          ok: false,
          message:
            locale === "ar"
              ? "طلبك قيد المراجعة. سنتواصل معك قريباً بعد الموافقة على ملفك."
              : "Votre dossier est en cours d'examen. Nous vous contacterons après validation.",
        },
        { status: 403 },
      );
    }

    if (provider.status === "rejected") {
      return NextResponse.json(
        {
          ok: false,
          message:
            locale === "ar"
              ? "لم تتم الموافقة على طلبك. تواصل معنا لمزيد من المعلومات."
              : "Votre candidature n'a pas été retenue. Contactez-nous pour plus d'informations.",
        },
        { status: 403 },
      );
    }

    await setProviderSessionCookie(provider.id);

    return NextResponse.json({
      ok: true,
      redirectTo: `/${locale}/provider`,
    });
  } catch (error) {
    console.error("[provider/login] unexpected error:", error);
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "تعذر تسجيل الدخول حالياً. حاول مرة أخرى.",
      },
      { status: 400 },
    );
  }
}
