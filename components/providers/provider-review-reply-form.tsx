"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ProviderReviewReplyFormProps = {
  locale: "ar" | "fr";
  reviewId: string;
};

export function ProviderReviewReplyForm({ locale, reviewId }: ProviderReviewReplyFormProps) {
  const router = useRouter();
  const [reply, setReply] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  async function submitReply() {
    setPending(true);
    setMessage(null);
    setIsError(false);

    try {
      const response = await fetch(`/api/provider/reviews/${reviewId}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reply }),
      });

      const data = (await response.json()) as { ok?: boolean; message?: string };

      if (!response.ok || !data.ok) {
        setIsError(true);
        setMessage(data.message ?? (locale === "ar" ? "تعذر حفظ الرد." : "Impossible d'enregistrer la réponse."));
        return;
      }

      setReply("");
      setMessage(data.message ?? (locale === "ar" ? "تم حفظ الرد وإرساله للمراجعة." : "Réponse enregistrée et envoyée à la modération."));
      router.refresh();
    } catch {
      setIsError(true);
      setMessage(locale === "ar" ? "تعذر حفظ الرد حالياً." : "Impossible d'enregistrer la réponse pour le moment.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-3 rounded-[1rem] border border-[var(--line)] bg-[var(--soft)] p-3">
      <label className="block">
        <span className="mb-2 block text-xs font-semibold text-[var(--muted)]">
          {locale === "ar" ? "رد المزود على التقييم" : "Réponse du prestataire"}
        </span>
        <textarea
          value={reply}
          onChange={(event) => setReply(event.target.value)}
          rows={3}
          className="input-base min-h-24 resize-y text-sm"
          placeholder={locale === "ar" ? "أضف رداً مهنياً ومحترماً، وسيظهر بعد مراجعة الإدارة." : "Ajoutez une réponse professionnelle. Elle sera publiée après validation admin."}
        />
      </label>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button type="button" onClick={submitReply} disabled={pending || reply.trim().length < 6} className="button-primary">
          {pending ? "..." : locale === "ar" ? "إرسال الرد للمراجعة" : "Envoyer la réponse"}
        </button>
        {message ? (
          <p role={isError ? "alert" : "status"} className={`text-xs font-medium ${isError ? "text-rose-700" : "text-emerald-700"}`}>
            {message}
          </p>
        ) : null}
      </div>
    </div>
  );
}
