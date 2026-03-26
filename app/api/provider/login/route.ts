import { NextResponse } from "next/server";
import { authenticateProviderWithAccessCode, authenticateProviderWithPassword, findProviderByIdentifier, setProviderSessionCookie } from "@/lib/provider-auth";

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
              : "Saisissez votre e-mail ou téléphone avec le mot de passe, ou le code d’accès de secours.",
        },
        { status: 400 },
      );
    }

    const provider =
      (payload.password?.trim()
        ? await authenticateProviderWithPassword(identifier, payload.password)
        : null) ??
      (payload.accessCode?.trim()
        ? await authenticateProviderWithAccessCode(identifier, payload.accessCode)
        : null);

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
            : "Votre dossier est en cours d’examen. Nous vous contacterons après validation de votre profil.";
      } else if (matched.status === "rejected") {
        failMessage =
          locale === "ar"
            ? "لم تتم الموافقة على طلبك. تواصل معنا لمزيد من المعلومات."
            : "Votre candidature n’a pas été retenue. Contactez-nous pour plus d’informations.";
      } else {
        failMessage =
          locale === "ar"
            ? "البريد الإلكتروني أو كلمة المرور غير صحيحة. تأكد من البيانات وحاول مجدداً."
            : "E-mail ou mot de passe incorrect. Vérifiez vos identifiants et réessayez.";
      }

      return NextResponse.json({ ok: false, message: failMessage }, { status: 401 });
    }

    await setProviderSessionCookie(provider.id);

    return NextResponse.json({
      ok: true,
      redirectTo: `/${locale}/provider`,
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
