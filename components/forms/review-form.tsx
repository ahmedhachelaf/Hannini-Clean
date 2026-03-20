"use client";

import { useState } from "react";
import type { Locale, Provider, ReviewSubmissionResult } from "@/lib/types";

type ReviewFormProps = {
  locale: Locale;
  provider: Provider;
  bookingId: string;
  labels: {
    title: string;
    description: string;
    successTitle: string;
    successDescription: string;
    fields: {
      fullName: string;
      rating: string;
      comment: string;
    };
  };
};

export function ReviewForm({ locale, provider, bookingId, labels }: ReviewFormProps) {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<ReviewSubmissionResult | null>(null);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setResult(null);

    const payload = {
      bookingId,
      providerId: provider.id,
      customerName: String(formData.get("customerName") ?? ""),
      rating: Number(formData.get("rating") ?? 0),
      comment: String(formData.get("comment") ?? ""),
    };

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as ReviewSubmissionResult;
      setResult(data);
    } catch (error) {
      setResult({
        ok: false,
        message: locale === "ar" ? "تعذر حفظ التقييم حالياً." : "Impossible d'enregistrer l'avis pour le moment.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={handleSubmit} className="surface-card flex flex-col gap-5 rounded-[1.75rem] p-6">
      <div>
        <h2 className={`text-2xl font-extrabold tracking-tight ${locale === "ar" ? "arabic-display" : ""}`}>{labels.title}</h2>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{labels.description}</p>
      </div>

      <label>
        <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{labels.fields.fullName}</span>
        <input name="customerName" required className="input-base" />
      </label>

      <label>
        <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{labels.fields.rating}</span>
        <select name="rating" required className="input-base">
          <option value="5">5</option>
          <option value="4">4</option>
          <option value="3">3</option>
          <option value="2">2</option>
          <option value="1">1</option>
        </select>
      </label>

      <label>
        <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{labels.fields.comment}</span>
        <textarea name="comment" required rows={5} className="input-base min-h-32 resize-y" />
      </label>

      {result ? (
        <div className={`rounded-2xl border px-4 py-3 text-sm ${result.ok ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
          <div className="font-semibold">{result.ok ? labels.successTitle : locale === "ar" ? "تعذر الحفظ" : "Enregistrement impossible"}</div>
          <div className="mt-1">{result.ok ? labels.successDescription : result.message}</div>
        </div>
      ) : null}

      <button type="submit" disabled={pending} className="button-primary w-full sm:w-fit">
        {pending ? (locale === "ar" ? "جارٍ الحفظ..." : "Enregistrement...") : locale === "ar" ? "حفظ التقييم" : "Enregistrer l'avis"}
      </button>
    </form>
  );
}
