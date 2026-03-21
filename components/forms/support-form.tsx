"use client";

import { useState } from "react";
import type { Locale, SupportSubmissionResult } from "@/lib/types";

type SupportFormProps = {
  locale: Locale;
  defaultValues?: {
    actorRole?: "customer" | "provider";
    bookingId?: string;
    providerId?: string;
    providerSlug?: string;
  };
  labels: {
    title: string;
    description: string;
    actorLabel: string;
    actorCustomer: string;
    actorProvider: string;
    categoryLabel: string;
    subjectLabel: string;
    messageLabel: string;
    phoneLabel: string;
    emailLabel: string;
    bookingReferenceLabel: string;
    providerReferenceLabel: string;
    attachmentsLabel: string;
    categories: Record<string, string>;
    successTitle: string;
    successDescription: string;
    openThread: string;
  };
};

export function SupportForm({ locale, defaultValues, labels }: SupportFormProps) {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<SupportSubmissionResult | null>(null);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setResult(null);

    try {
      const response = await fetch("/api/support", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as SupportSubmissionResult;
      setResult(data);
    } catch {
      setResult({
        ok: false,
        message: locale === "ar" ? "تعذر فتح طلب الدعم حالياً." : "Impossible de creer la demande de support pour le moment.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      action={handleSubmit}
      className="surface-card flex flex-col gap-5 rounded-[1.75rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(231,240,255,0.94))] p-6"
    >
      <div>
        <h1 className={`text-3xl font-extrabold tracking-tight ${locale === "ar" ? "arabic-display" : ""}`}>{labels.title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)]">{labels.description}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{labels.actorLabel}</span>
          <select name="actorRole" defaultValue={defaultValues?.actorRole ?? "customer"} className="input-base">
            <option value="customer">{labels.actorCustomer}</option>
            <option value="provider">{labels.actorProvider}</option>
          </select>
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{labels.categoryLabel}</span>
          <select name="category" defaultValue="general_support" className="input-base">
            {Object.entries(labels.categories).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label>
        <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{labels.subjectLabel}</span>
        <input name="subject" required className="input-base" />
      </label>

      <label>
        <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{labels.messageLabel}</span>
        <textarea name="message" required rows={6} className="input-base min-h-36 resize-y" />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{labels.phoneLabel}</span>
          <input name="phoneNumber" type="tel" className="input-base" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{labels.emailLabel}</span>
          <input name="email" type="email" className="input-base" />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{labels.bookingReferenceLabel}</span>
          <input name="bookingId" defaultValue={defaultValues?.bookingId ?? ""} className="input-base" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{labels.providerReferenceLabel}</span>
          <input name="providerSlug" defaultValue={defaultValues?.providerSlug ?? ""} className="input-base" />
        </label>
      </div>

      <input type="hidden" name="providerId" value={defaultValues?.providerId ?? ""} />

      <label>
        <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{labels.attachmentsLabel}</span>
        <input name="attachments" type="file" accept="image/*" multiple className="input-base py-3" />
      </label>

      {result?.ok ? (
        <div className="rounded-[1.25rem] border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
          <div className="font-semibold">{labels.successTitle}</div>
          <div className="mt-1">{labels.successDescription}</div>
          {result.caseId ? (
            <a href={`/${locale}/support/${result.caseId}`} className="button-primary mt-4 inline-flex">
              {labels.openThread}
            </a>
          ) : null}
        </div>
      ) : null}

      {result?.message && !result.ok ? <p className="text-sm text-rose-700">{result.message}</p> : null}

      <button type="submit" disabled={pending} className="button-primary w-full sm:w-fit">
        {pending ? (locale === "ar" ? "جارٍ الإرسال..." : "Envoi...") : locale === "ar" ? "إرسال الطلب" : "Envoyer la demande"}
      </button>
    </form>
  );
}
