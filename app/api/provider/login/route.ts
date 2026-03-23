import { NextResponse } from "next/server";
import { authenticateProviderWithAccessCode, authenticateProviderWithPassword, setProviderSessionCookie } from "@/lib/provider-auth";

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
      return NextResponse.json(
        {
          ok: false,
          message:
            locale === "ar"
              ? "تعذر التحقق من بيانات الدخول. راجع البريد الإلكتروني أو الرقم وكلمة المرور."
              : "Impossible de vérifier vos accès. Vérifiez l’e-mail ou le numéro ainsi que le mot de passe.",
        },
        { status: 401 },
      );
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
