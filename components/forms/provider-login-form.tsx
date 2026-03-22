"use client";

import { useState } from "react";

type ProviderLoginFormProps = {
  locale: "ar" | "fr";
};

export function ProviderLoginForm({ locale }: ProviderLoginFormProps) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

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
          token: String(formData.get("token") ?? ""),
        }),
      });

      const data = (await response.json()) as { ok?: boolean; message?: string; redirectTo?: string };

      if (!response.ok || !data.ok) {
        setIsError(true);
        setMessage(
          data.message ??
            (locale === "ar"
              ? "تعذر تسجيل الدخول حالياً. تحقق من الرقم ورمز الإدارة."
              : "Connexion impossible pour le moment. Vérifiez le numéro et le code d’accès."),
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
            ? "استخدم رقم الهاتف أو واتساب مع رمز الإدارة الذي ظهر لك بعد إرسال طلب الانضمام، حتى تتابع الطلبات وتحدّث ملفك."
            : "Utilisez votre numéro de téléphone ou WhatsApp avec le code d’accès reçu après votre demande d’inscription pour suivre vos demandes et mettre à jour votre profil."}
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
          {locale === "ar" ? "رمز الإدارة" : "Code d’accès"}
        </span>
        <input name="token" required className="input-base" />
      </label>

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
