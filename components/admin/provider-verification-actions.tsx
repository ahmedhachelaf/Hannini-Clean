"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Locale } from "@/lib/types";

type ProviderVerificationActionsProps = {
  locale: Locale;
  providerId: string;
  status: "pending" | "verified" | "rejected";
  contactVerified: boolean;
};

export function ProviderVerificationActions({
  locale,
  providerId,
  status,
  contactVerified,
}: ProviderVerificationActionsProps) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  async function runAction(action: "verify" | "reject" | "unverify") {
    if (action === "reject" && !note.trim()) {
      setIsError(true);
      setMessage(locale === "ar" ? "يرجى كتابة سبب الرفض." : "Merci d'indiquer le motif du rejet.");
      return;
    }

    setPending(action);
    setIsError(false);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/providers/${providerId}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });

      const data = (await response.json()) as { ok?: boolean; message?: string };

      if (!response.ok || !data.ok) {
        setIsError(true);
        setMessage(data.message ?? (locale === "ar" ? "تعذر تنفيذ العملية." : "Action impossible."));
        return;
      }

      setMessage(data.message ?? (locale === "ar" ? "تم التحديث." : "Mise a jour effectuee."));
      router.refresh();
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="rounded-[1.25rem] border border-[var(--line)] bg-[var(--soft)] p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
        {locale === "ar" ? "قرارات التوثيق" : "Décisions de vérification"}
      </div>
      <textarea
        value={note}
        onChange={(event) => setNote(event.target.value)}
        rows={3}
        className="input-base mt-3 min-h-20 resize-y text-sm"
        placeholder={
          locale === "ar" ? "سبب الرفض أو ملاحظة (مطلوب عند الرفض)" : "Motif du rejet ou note (requis si rejet)"
        }
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending !== null || status === "verified" || !contactVerified}
          className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 disabled:opacity-50"
          onClick={() => runAction("verify")}
        >
          {pending === "verify" ? "..." : locale === "ar" ? "تحقق ✓" : "Vérifier ✓"}
        </button>
        <button
          type="button"
          disabled={pending !== null || status === "rejected"}
          className="rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 disabled:opacity-50"
          onClick={() => runAction("reject")}
        >
          {pending === "reject" ? "..." : locale === "ar" ? "رفض ✗" : "Rejeter ✗"}
        </button>
        <button
          type="button"
          disabled={pending !== null || status !== "verified"}
          className="rounded-full border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-50"
          onClick={() => runAction("unverify")}
        >
          {pending === "unverify" ? "..." : locale === "ar" ? "إلغاء التوثيق" : "Retirer le badge"}
        </button>
      </div>
      {message ? (
        <p className={`mt-3 text-xs font-medium ${isError ? "text-rose-700" : "text-emerald-700"}`}>{message}</p>
      ) : null}
      {!contactVerified ? (
        <p className="mt-3 text-xs font-medium text-amber-700">
          {locale === "ar"
            ? "لا يمكن اعتماد المزوّد قبل التحقق من الهاتف أو البريد الإلكتروني."
            : "La validation admin reste bloquée tant que le téléphone ou l’e-mail n’est pas vérifié."}
        </p>
      ) : null}
    </div>
  );
}
