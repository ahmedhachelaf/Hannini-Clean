"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Locale, Provider } from "@/lib/types";

type ProviderActionsProps = {
  providerId: string;
  locale: Locale;
  status: Provider["status"];
  isVerified: boolean;
  labels: {
    approve: string;
    reject: string;
    needsMoreInfo: string;
    verify: string;
    unverify: string;
  };
};

export function ProviderActions({ providerId, locale, status, isVerified, labels }: ProviderActionsProps) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const canVerify = status === "approved" && !isVerified;
  const isPubliclyVisible = status === "approved";

  async function runAction(path: string, action: string) {
    setPending(action);
    setMessage("");
    setIsError(false);

    try {
      const response = await fetch(path, {
        method: "POST",
      });

      const data = (await response.json()) as { ok?: boolean; message?: string };

      if (!response.ok || !data.ok) {
        setIsError(true);
        setMessage(data.message ?? (locale === "ar" ? "تعذر تنفيذ العملية." : "Action impossible."));
        return;
      }

      setMessage(data.message ?? (locale === "ar" ? "تم تحديث الحالة." : "Statut mis a jour."));
      router.refresh();
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="w-full rounded-[1.5rem] border border-[var(--line)] bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(232,242,255,0.92))] p-4 shadow-[0_18px_40px_rgba(15,95,255,0.08)] xl:w-[320px]">
      <div className="rounded-[1.25rem] border border-[var(--line)] bg-white px-4 py-4 text-sm leading-7 text-[var(--muted)]">
        <div className="font-semibold text-[var(--ink)]">
          {locale === "ar" ? "حالة الظهور والثقة" : "Visibilité et confiance"}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className={`status-pill ${isPubliclyVisible ? "status-pill--verified" : "status-pill--pending"}`}>
            {isPubliclyVisible
              ? locale === "ar"
                ? "يظهر للعموم الآن"
                : "Visible publiquement"
              : locale === "ar"
                ? "غير ظاهر للعموم بعد"
                : "Pas encore visible publiquement"}
          </span>
          <span className={`status-pill ${isVerified ? "status-pill--verified" : "border border-[var(--line)] bg-[var(--soft)] text-[var(--ink)]"}`}>
            {isVerified
              ? locale === "ar"
                ? "شارة التوثيق مفعّلة"
                : "Badge vérifié actif"
              : locale === "ar"
                ? "بدون شارة توثيق"
                : "Sans badge vérifié"}
          </span>
        </div>
        <p className="mt-3 text-xs leading-6 text-[var(--muted)]">
          {locale === "ar"
            ? "القبول يجعل الملف قابلاً للظهور في القوائم العامة. التوثيق يضيف شارة ثقة فقط بعد المراجعة."
            : "L'approbation rend le profil visible dans les listes publiques. La vérification ajoute seulement un badge de confiance après revue."}
        </p>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
            {locale === "ar" ? "قرارات المراجعة" : "Décisions de revue"}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={pending !== null || status === "approved"}
              className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 disabled:opacity-50"
              onClick={() => runAction(`/api/admin/providers/${providerId}/approve`, "approve")}
            >
              {pending === "approve" ? (locale === "ar" ? "..." : "...") : labels.approve}
            </button>
            <button
              type="button"
              disabled={pending !== null || status === "needs_more_info"}
              className="rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 disabled:opacity-50"
              onClick={() => runAction(`/api/admin/providers/${providerId}/needs-more-info`, "needs-more-info")}
            >
              {pending === "needs-more-info" ? (locale === "ar" ? "..." : "...") : labels.needsMoreInfo}
            </button>
            <button
              type="button"
              disabled={pending !== null || status === "rejected"}
              className="rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 disabled:opacity-50"
              onClick={() => runAction(`/api/admin/providers/${providerId}/reject`, "reject")}
            >
              {pending === "reject" ? (locale === "ar" ? "..." : "...") : labels.reject}
            </button>
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
            {locale === "ar" ? "التوثيق والثقة" : "Vérification et confiance"}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={pending !== null || !canVerify}
              className="rounded-full border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 disabled:opacity-50"
              onClick={() => runAction(`/api/admin/providers/${providerId}/verify`, "verify")}
            >
              {pending === "verify" ? (locale === "ar" ? "..." : "...") : labels.verify}
            </button>
            <button
              type="button"
              disabled={pending !== null || !isVerified}
              className="rounded-full border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-50"
              onClick={() => runAction(`/api/admin/providers/${providerId}/unverify`, "unverify")}
            >
              {pending === "unverify" ? (locale === "ar" ? "..." : "...") : labels.unverify}
            </button>
          </div>
          {!canVerify && !isVerified ? (
            <p className="mt-2 text-xs leading-6 text-[var(--muted)]">
              {locale === "ar"
                ? "فعّل التوثيق بعد القبول فقط، حتى تبقى خطوات المراجعة واضحة."
                : "Activez la vérification seulement après approbation pour garder la revue claire."}
            </p>
          ) : null}
        </div>
      </div>

      {message ? (
        <p
          role={isError ? "alert" : "status"}
          aria-live="polite"
          className={`mt-4 text-xs font-medium ${isError ? "text-rose-700" : "text-emerald-700"}`}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
