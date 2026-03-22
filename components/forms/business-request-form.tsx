"use client";

import { useMemo, useState } from "react";
import type { BusinessRequestSubmissionResult, Category, Locale, Zone } from "@/lib/types";

type BusinessRequestFormProps = {
  locale: Locale;
  categories: Category[];
  zones: Zone[];
  labels: {
    title: string;
    description: string;
    companyName: string;
    contactName: string;
    phone: string;
    email: string;
    category: string;
    descriptionField: string;
    wilaya: string;
    frequency: string;
    oneTime: string;
    recurring: string;
    timeline: string;
    budget: string;
    preferredProviderType: string;
    serviceProvider: string;
    homeBusiness: string;
    either: string;
    attachment: string;
    consent: string;
    helper: string;
    successTitle: string;
    successDescription: string;
    submit: string;
  };
};

export function BusinessRequestForm({ locale, categories, zones, labels }: BusinessRequestFormProps) {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<BusinessRequestSubmissionResult | null>(null);
  const [consentAccepted, setConsentAccepted] = useState(false);

  const provinces = useMemo(
    () =>
      Array.from(new Map(zones.map((zone) => [zone.provinceSlug, zone.provinceName])).entries()).map(([slug, name]) => ({
        slug,
        name,
      })),
    [zones],
  );

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setResult(null);

    try {
      const response = await fetch("/api/business-requests", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as BusinessRequestSubmissionResult;
      setResult(data);
    } catch {
      setResult({
        ok: false,
        message: locale === "ar" ? "تعذر إرسال الطلب حالياً." : "Impossible d'envoyer la demande pour le moment.",
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
      <input type="hidden" name="locale" value={locale} />

      <div>
        <h2 className={`text-3xl font-extrabold tracking-tight ${locale === "ar" ? "arabic-display" : ""}`}>{labels.title}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)]">{labels.description}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">
            {labels.companyName} <span className="text-[var(--navy)]">• {locale === "ar" ? "مطلوب" : "Obligatoire"}</span>
          </span>
          <input name="companyName" required className="input-base" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">
            {labels.contactName} <span className="text-[var(--navy)]">• {locale === "ar" ? "مطلوب" : "Obligatoire"}</span>
          </span>
          <input name="contactName" required className="input-base" />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">
            {labels.phone} <span className="text-[var(--navy)]">• {locale === "ar" ? "مطلوب" : "Obligatoire"}</span>
          </span>
          <input name="phone" type="tel" required className="input-base" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{labels.email}</span>
          <input name="email" type="email" className="input-base" />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">
            {labels.category} <span className="text-[var(--navy)]">• {locale === "ar" ? "مطلوب" : "Obligatoire"}</span>
          </span>
          <select name="categorySlug" required className="input-base" defaultValue={categories[0]?.slug ?? ""}>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.icon} {category.name[locale]}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">
            {labels.wilaya} <span className="text-[var(--navy)]">• {locale === "ar" ? "مطلوب" : "Obligatoire"}</span>
          </span>
          <select name="wilayaSlug" required className="input-base" defaultValue={provinces[0]?.slug ?? ""}>
            {provinces.map((province) => (
              <option key={province.slug} value={province.slug}>
                {province.name[locale]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label>
        <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">
          {labels.descriptionField} <span className="text-[var(--navy)]">• {locale === "ar" ? "مطلوب" : "Obligatoire"}</span>
        </span>
        <textarea name="description" required rows={6} className="input-base min-h-36 resize-y" />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{labels.frequency}</span>
          <select name="frequency" className="input-base" defaultValue="one_time">
            <option value="one_time">{labels.oneTime}</option>
            <option value="recurring">{labels.recurring}</option>
          </select>
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">
            {labels.timeline} <span className="text-[var(--navy)]">• {locale === "ar" ? "مطلوب" : "Obligatoire"}</span>
          </span>
          <input name="timeline" required className="input-base" />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{labels.budget}</span>
          <input name="budget" className="input-base" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{labels.preferredProviderType}</span>
          <select name="preferredProviderType" className="input-base" defaultValue="either">
            <option value="service_provider">{labels.serviceProvider}</option>
            <option value="home_business">{labels.homeBusiness}</option>
            <option value="either">{labels.either}</option>
          </select>
        </label>
      </div>

      <label>
        <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{labels.attachment}</span>
        <input name="attachments" type="file" className="input-base py-3" />
      </label>

      <div className="rounded-[1.5rem] border border-[rgba(15,95,255,0.14)] bg-[var(--soft)] p-5">
        <label className="flex items-start gap-3">
          <input
            name="consentAccepted"
            type="checkbox"
            checked={consentAccepted}
            onChange={(event) => setConsentAccepted(event.target.checked)}
            className="mt-1 h-4 w-4 accent-[var(--accent)]"
          />
          <div>
            <div className="text-sm font-semibold text-[var(--ink)]">
              {labels.consent} <span className="text-[var(--navy)]">• {locale === "ar" ? "مطلوب" : "Obligatoire"}</span>
            </div>
            <div className="mt-1 text-xs leading-6 text-[var(--muted)]">{labels.helper}</div>
          </div>
        </label>
      </div>

      {result?.ok ? (
        <div role="status" aria-live="polite" className="rounded-[1.25rem] border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
          <div className="font-semibold">{labels.successTitle}</div>
          <div className="mt-1">{labels.successDescription}</div>
        </div>
      ) : null}

      {result?.message && !result.ok ? (
        <p role="alert" aria-live="polite" className="text-sm font-medium text-rose-700">
          {result.message}
        </p>
      ) : null}

      <button type="submit" disabled={pending || !consentAccepted} className="button-primary w-full sm:w-fit">
        {pending ? (locale === "ar" ? "جارٍ الإرسال..." : "Envoi...") : labels.submit}
      </button>
    </form>
  );
}
