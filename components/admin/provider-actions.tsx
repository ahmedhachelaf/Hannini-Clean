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
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
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
          disabled={pending !== null || status === "rejected"}
          className="rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 disabled:opacity-50"
          onClick={() => runAction(`/api/admin/providers/${providerId}/reject`, "reject")}
        >
          {pending === "reject" ? (locale === "ar" ? "..." : "...") : labels.reject}
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
          disabled={pending !== null || isVerified}
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

      {message ? (
        <p className={`text-xs font-medium ${isError ? "text-rose-700" : "text-emerald-700"}`}>{message}</p>
      ) : null}
    </div>
  );
}
