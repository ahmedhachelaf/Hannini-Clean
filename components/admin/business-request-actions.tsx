"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { BusinessRequest, Locale, Provider } from "@/lib/types";

type BusinessRequestActionsProps = {
  locale: Locale;
  businessRequest: BusinessRequest;
  suggestedProviders: Provider[];
  labels: {
    businessRequestStatus: string;
    businessRequestNotes: string;
    businessMatches: string;
    save: string;
    businessNew: string;
    businessUnderReview: string;
    businessMatched: string;
    businessClosed: string;
    businessRejected: string;
    businessMatchingHint: string;
  };
};

const statusOptions: BusinessRequest["status"][] = ["new", "under_review", "matched", "closed", "rejected"];

export function BusinessRequestActions({ locale, businessRequest, suggestedProviders, labels }: BusinessRequestActionsProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const statusLabels: Record<BusinessRequest["status"], string> = {
    new: labels.businessNew,
    under_review: labels.businessUnderReview,
    matched: labels.businessMatched,
    closed: labels.businessClosed,
    rejected: labels.businessRejected,
  };

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await fetch(`/api/admin/business-requests/${businessRequest.id}`, {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as { ok?: boolean; message?: string };

      if (!response.ok || !data.ok) {
        setIsError(true);
        setMessage(data.message ?? (locale === "ar" ? "تعذر تحديث الطلب." : "Impossible de mettre à jour la demande."));
        return;
      }

      setMessage(data.message ?? (locale === "ar" ? "تم التحديث." : "Mise à jour effectuée."));
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={handleSubmit} className="rounded-[1.5rem] border border-[var(--line)] bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(232,242,255,0.92))] p-4">
      <div className="mb-4 rounded-[1.25rem] border border-[var(--line)] bg-white px-4 py-4 text-sm leading-7 text-[var(--muted)]">
        <div className="font-semibold text-[var(--ink)]">
          {locale === "ar" ? "مراجعة طلب الشركة" : "Revue de la demande entreprise"}
        </div>
        <p className="mt-2">{labels.businessMatchingHint}</p>
      </div>

      <div className="grid gap-4">
        <label>
          <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{labels.businessRequestStatus}</span>
          <select name="status" defaultValue={businessRequest.status} className="input-base">
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
        </label>

        <fieldset>
          <legend className="mb-2 block text-sm font-semibold text-[var(--muted)]">{labels.businessMatches}</legend>
          <div className="grid gap-2">
            {suggestedProviders.length === 0 ? (
              <div className="rounded-[1.15rem] border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--muted)]">
                {locale === "ar" ? "لا يوجد مزودون مناسبون ظاهرون حالياً لهذا الطلب." : "Aucun profil visible n'est encore suggéré pour cette demande."}
              </div>
            ) : (
              suggestedProviders.map((provider) => (
                <label key={provider.id} className="flex items-start gap-3 rounded-[1.15rem] border border-[var(--line)] bg-white px-4 py-3">
                  <input
                    type="checkbox"
                    name="matchedProviderIds"
                    value={provider.id}
                    defaultChecked={businessRequest.matchedProviderIds.includes(provider.id)}
                    className="mt-1 h-4 w-4 accent-[var(--accent)]"
                  />
                  <div className="text-sm leading-7">
                    <div className="font-semibold text-[var(--ink)]">{provider.displayName}</div>
                    <div className="text-[var(--muted)]">{provider.shortTagline[locale]}</div>
                  </div>
                </label>
              ))
            )}
          </div>
        </fieldset>

        <label>
          <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{labels.businessRequestNotes}</span>
          <textarea name="adminNotes" rows={4} defaultValue={businessRequest.adminNotes ?? ""} className="input-base min-h-28 resize-y" />
        </label>
      </div>

      {message ? (
        <p role={isError ? "alert" : "status"} aria-live="polite" className={`mt-3 text-xs font-medium ${isError ? "text-rose-700" : "text-emerald-700"}`}>
          {message}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className="button-primary mt-4">
        {pending ? "..." : labels.save}
      </button>
    </form>
  );
}
