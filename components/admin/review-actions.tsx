"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Locale, Review } from "@/lib/types";

type ReviewActionsProps = {
  locale: Locale;
  review: Review;
  labels: {
    reviewStatus: string;
    reviewAdminNote: string;
    reviewPending: string;
    reviewApproved: string;
    reviewRejected: string;
    approve: string;
    reject: string;
    save: string;
  };
};

const statusOptions: Review["status"][] = ["pending_review", "approved", "rejected"];

export function ReviewActions({ locale, review, labels }: ReviewActionsProps) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [status, setStatus] = useState<Review["status"]>(review.status);
  const [adminNote, setAdminNote] = useState(review.adminNote ?? "");

  const statusLabels: Record<Review["status"], string> = {
    pending_review: labels.reviewPending,
    approved: labels.reviewApproved,
    rejected: labels.reviewRejected,
  };

  async function save(nextStatus: Review["status"], action: string) {
    setPending(action);
    setMessage("");
    setIsError(false);

    try {
      const response = await fetch(`/api/admin/reviews/${review.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: nextStatus,
          adminNote,
        }),
      });

      const data = (await response.json()) as { ok?: boolean; message?: string };

      if (!response.ok || !data.ok) {
        setIsError(true);
        setMessage(data.message ?? (locale === "ar" ? "تعذر تحديث التقييم." : "Impossible de mettre à jour l'avis."));
        return;
      }

      setStatus(nextStatus);
      setMessage(data.message ?? (locale === "ar" ? "تم تحديث التقييم." : "Avis mis à jour."));
      router.refresh();
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="rounded-[1.35rem] border border-[var(--line)] bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(232,242,255,0.92))] p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{labels.reviewStatus}</div>
      <div className="mt-2 flex flex-wrap gap-2">
        {statusOptions.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => save(option, option)}
            disabled={pending !== null || status === option}
            className={`rounded-full border px-3 py-2 text-xs font-semibold disabled:opacity-50 ${
              option === "approved"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : option === "rejected"
                  ? "border-rose-200 bg-rose-50 text-rose-700"
                  : "border-amber-200 bg-amber-50 text-amber-700"
            }`}
          >
            {pending === option ? "..." : statusLabels[option]}
          </button>
        ))}
      </div>

      <label className="mt-4 block">
        <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{labels.reviewAdminNote}</span>
        <textarea
          value={adminNote}
          onChange={(event) => setAdminNote(event.target.value)}
          rows={3}
          className="input-base min-h-20 resize-y text-sm"
          placeholder={locale === "ar" ? "ملاحظة داخلية أو سبب الإخفاء (اختياري)" : "Note interne ou motif de masquage (optionnel)"}
        />
      </label>

      <button type="button" onClick={() => save(status, "save")} disabled={pending !== null} className="button-primary mt-4 w-full">
        {pending === "save" ? "..." : labels.save}
      </button>

      {message ? (
        <p role={isError ? "alert" : "status"} aria-live="polite" className={`mt-3 text-xs font-medium ${isError ? "text-rose-700" : "text-emerald-700"}`}>
          {message}
        </p>
      ) : null}
    </div>
  );
}
