import { NextResponse } from "next/server";
import { authenticateProviderWithAccessCode, authenticateProviderWithPassword, setProviderSessionCookie } from "@/lib/provider-auth";

export async function POST(request: Request) {
  try {
    const locale = request.headers.get("x-hannini-locale") === "fr" ? "fr" : "ar";
    const payload = (await request.json().catch(() => null)) as
      | {
          phoneOrWhatsapp?: string;
          password?: string;
          accessCode?: string;
        }
      | null;

    if (!payload?.phoneOrWhatsapp?.trim() || (!payload?.password?.trim() && !payload?.accessCode?.trim())) {
      return NextResponse.json(
        {
          ok: false,
          message:
            locale === "ar"
              ? "أدخل رقم الهاتف مع كلمة المرور أو رمز الوصول الاحتياطي."
              : "Saisissez votre téléphone avec le mot de passe ou le code d’accès de secours.",
        },
        { status: 400 },
      );
    }

    const provider =
      (payload.password?.trim()
        ? await authenticateProviderWithPassword(payload.phoneOrWhatsapp, payload.password)
        : null) ??
      (payload.accessCode?.trim()
        ? await authenticateProviderWithAccessCode(payload.phoneOrWhatsapp, payload.accessCode)
        : null);

    if (!provider || !provider.verification.managementToken) {
      return NextResponse.json(
        {
          ok: false,
          message:
            locale === "ar"
              ? "تعذر التحقق من بيانات الدخول. راجع الرقم وكلمة المرور، أو استخدم رمز الوصول إذا لم تعيّن كلمة مرور بعد."
              : "Impossible de vérifier vos accès. Vérifiez le numéro et le mot de passe, ou utilisez le code d’accès si aucun mot de passe n’a encore été défini.",
        },
        { status: 401 },
      );
    }

    await setProviderSessionCookie({
      providerId: provider.id,
      token: provider.verification.managementToken,
    });

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
