"use client";

import { useState } from "react";

type ProviderLoginFormProps = {
  locale: "ar" | "fr";
};

export function ProviderLoginForm({ locale }: ProviderLoginFormProps) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [useAccessCode, setUseAccessCode] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await fetch("/api/provider/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-hannini-locale": locale,
        },
        body: JSON.stringify({
          phoneOrWhatsapp: String(formData.get("phoneOrWhatsapp") ?? ""),
          password: String(formData.get("password") ?? ""),
          accessCode: String(formData.get("accessCode") ?? ""),
        }),
      });

      const data = (await response.json()) as { ok?: boolean; message?: string; redirectTo?: string };

      if (!response.ok || !data.ok) {
        setIsError(true);
        setMessage(
          data.message ??
            (locale === "ar"
              ? "تعذر تسجيل الدخول حالياً. تحقق من الرقم وكلمة المرور أو استخدم رمز الوصول الاحتياطي."
              : "Connexion impossible pour le moment. Vérifiez le numéro et le mot de passe, ou utilisez le code d’accès de secours."),
        );
        return;
      }

      window.location.href = data.redirectTo ?? `/${locale}/provider`;
    } catch {
      setIsError(true);
      setMessage(
        locale === "ar"
          ? "تعذر تسجيل الدخول حالياً. حاول مرة أخرى."
          : "Connexion impossible pour le moment. Merci de réessayer.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={handleSubmit} className="surface-card flex flex-col gap-5 rounded-[1.75rem] p-6">
      <div>
        <h1 className={`text-2xl font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>
          {locale === "ar" ? "دخول مزود الخدمة" : "Espace prestataire"}
        </h1>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
          {locale === "ar"
            ? "ادخل برقم الهاتف أو واتساب مع كلمة المرور التي اخترتها عند الانضمام. إذا كنت من المزودين القدامى، يمكنك استخدام رمز الوصول القديم مرة واحدة ثم تعيين كلمة مرور من داخل الملف."
            : "Connectez-vous avec votre téléphone ou WhatsApp et le mot de passe choisi à l’inscription. Si vous avez un ancien accès, vous pouvez encore utiliser le code d’accès puis définir un mot de passe depuis votre profil."}
        </p>
      </div>

      <label>
        <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">
          {locale === "ar" ? "الهاتف أو واتساب" : "Téléphone ou WhatsApp"}
        </span>
        <input name="phoneOrWhatsapp" required className="input-base" />
      </label>

      <label>
        <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">
          {locale === "ar" ? "كلمة المرور" : "Mot de passe"}
        </span>
        <input name="password" type="password" required={!useAccessCode} className="input-base" />
      </label>

      <label className="flex items-start gap-3 rounded-[1.25rem] border border-[var(--line)] bg-[var(--soft)] px-4 py-4">
        <input
          type="checkbox"
          checked={useAccessCode}
          onChange={(event) => setUseAccessCode(event.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 accent-[var(--accent)]"
        />
        <span className="text-sm font-semibold leading-7 text-[var(--ink)]">
          {locale === "ar" ? "لدي رمز وصول قديم وأريد استخدامه كخيار احتياطي" : "J’ai un ancien code d’accès et je veux l’utiliser en secours"}
        </span>
      </label>

      {useAccessCode ? (
        <label>
          <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">
            {locale === "ar" ? "رمز الوصول الاحتياطي" : "Code d’accès de secours"}
          </span>
          <input name="accessCode" className="input-base" />
        </label>
      ) : null}

      {message ? (
        <div
          role={isError ? "alert" : "status"}
          className={`rounded-2xl border px-4 py-3 text-sm ${isError ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}
        >
          {message}
        </div>
      ) : null}

      <button type="submit" disabled={pending} className="button-primary w-full sm:w-fit">
        {pending ? (locale === "ar" ? "جارٍ الدخول..." : "Connexion...") : locale === "ar" ? "دخول" : "Se connecter"}
      </button>
    </form>
  );
}
