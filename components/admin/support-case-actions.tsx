"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Locale, SupportCase, SupportStatus } from "@/lib/types";

type SupportCaseActionsProps = {
  locale: Locale;
  supportCase: SupportCase;
  labels: {
    supportStatus: string;
    supportReply: string;
    open: string;
    inReview: string;
    waitingForUser: string;
    resolved: string;
    save: string;
  };
};

const statusOptions: SupportStatus[] = ["open", "in_review", "waiting_for_user", "resolved"];

export function SupportCaseActions({ locale, supportCase, labels }: SupportCaseActionsProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await fetch(`/api/admin/support/${supportCase.id}/status`, {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as { ok?: boolean; message?: string };

      if (!response.ok || !data.ok) {
        setIsError(true);
        setMessage(data.message ?? (locale === "ar" ? "تعذر تحديث الطلب." : "Impossible de mettre a jour le ticket."));
        return;
      }

      setMessage(data.message ?? (locale === "ar" ? "تم التحديث." : "Mise a jour effectuee."));
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  const statusLabels: Record<SupportStatus, string> = {
    open: labels.open,
    in_review: labels.inReview,
    waiting_for_user: labels.waitingForUser,
    resolved: labels.resolved,
  };

  return (
    <form action={handleSubmit} className="rounded-[1.5rem] border border-[var(--line)] bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(232,242,255,0.92))] p-4">
      <div className="mb-4 rounded-[1.25rem] border border-[var(--line)] bg-white px-4 py-4 text-sm leading-7 text-[var(--muted)]">
        <div className="font-semibold text-[var(--ink)]">
          {locale === "ar" ? "معالجة الطلب" : "Traitement du ticket"}
        </div>
        <p className="mt-2">
          {locale === "ar"
            ? "حدّد الحالة الحالية، ثم أضف رداً موجزاً إذا كنت تحتاج توضيحاً أو تريد إغلاق الحالة بشكل واضح."
            : "Choisissez le statut actuel, puis ajoutez une réponse courte si vous avez besoin d'une précision ou si vous clôturez le dossier."}
        </p>
      </div>
      <div className="grid gap-4">
        <label>
          <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{labels.supportStatus}</span>
          <select name="status" defaultValue={supportCase.status} className="input-base">
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{labels.supportReply}</span>
          <textarea name="replyMessage" rows={4} className="input-base min-h-28 resize-y" />
        </label>

        <label>
          <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">
            {locale === "ar" ? "مرفقات الرد" : "Pièces jointes"}
          </span>
          <input name="attachments" type="file" accept="image/*" multiple className="input-base py-3" />
        </label>
      </div>

      {message ? (
        <p
          role={isError ? "alert" : "status"}
          aria-live="polite"
          className={`mt-3 text-xs font-medium ${isError ? "text-rose-700" : "text-emerald-700"}`}
        >
          {message}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className="button-primary mt-4">
        {pending ? "..." : labels.save}
      </button>
    </form>
  );
}
