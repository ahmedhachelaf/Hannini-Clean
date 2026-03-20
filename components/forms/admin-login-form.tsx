"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Locale } from "@/lib/types";

type AdminLoginFormProps = {
  locale: Locale;
  title: string;
  description: string;
};

export function AdminLoginForm({ locale, title, description }: AdminLoginFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: String(formData.get("password") ?? ""),
        }),
      });

      const data = (await response.json()) as { ok: boolean; message?: string };

      if (!data.ok) {
        setError(data.message ?? (locale === "ar" ? "بيانات غير صحيحة." : "Identifiants invalides."));
        return;
      }

      router.push(`/${locale}/admin`);
      router.refresh();
    } catch (submitError) {
      setError(locale === "ar" ? "تعذر تسجيل الدخول حالياً." : "Connexion impossible pour le moment.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={handleSubmit} className="surface-card mx-auto flex w-full max-w-lg flex-col gap-5 rounded-[1.75rem] p-6">
      <div>
        <h1 className={`text-3xl font-extrabold tracking-tight ${locale === "ar" ? "arabic-display" : ""}`}>{title}</h1>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{description}</p>
      </div>

      <label>
        <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{locale === "ar" ? "كلمة المرور" : "Mot de passe"}</span>
        <input name="password" type="password" required className="input-base" />
      </label>

      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}

      <button type="submit" disabled={pending} className="button-primary w-full">
        {pending ? (locale === "ar" ? "جارٍ الدخول..." : "Connexion...") : locale === "ar" ? "دخول" : "Se connecter"}
      </button>
    </form>
  );
}
