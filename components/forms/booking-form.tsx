"use client";

import { useState } from "react";
import type { BookingSubmissionResult, Category, Locale, Provider, Zone } from "@/lib/types";

type BookingFormProps = {
  locale: Locale;
  provider: Provider;
  categories: Category[];
  zones: Zone[];
  labels: {
    title: string;
    description: string;
    successTitle: string;
    successDescription: string;
    openWhatsapp: string;
    fields: {
      fullName: string;
      phoneNumber: string;
      selectedService: string;
      date: string;
      time: string;
      zone: string;
      address: string;
      mapsLink: string;
      issueDescription: string;
      issuePhotos: string;
      notificationOption: string;
      notificationHint: string;
      preferredContactMethod: string;
      businessBuyerTitle: string;
      businessBuyerHint: string;
      isBusinessBuyer: string;
      quantityNeeded: string;
      productionNeed: string;
      requestedLeadTime: string;
      deliveryAreaNeeded: string;
    };
  };
};

export function BookingForm({ locale, provider, categories, zones, labels }: BookingFormProps) {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<BookingSubmissionResult | null>(null);
  const minimumDate = new Date().toISOString().slice(0, 10);
  const providerZones = zones.filter((zone) => provider.zones.includes(zone.slug));
  const submitLabel =
    provider.profileType === "home_business"
      ? locale === "ar"
        ? "إرسال الطلب"
        : "Envoyer la demande"
      : locale === "ar"
        ? "إرسال الحجز"
        : "Envoyer la réservation";
  const titleLabel =
    provider.profileType === "home_business"
      ? locale === "ar"
        ? "إرسال طلب أو استفسار"
        : "Envoyer une demande ou précommande"
      : labels.title;

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setResult(null);
    formData.set("providerId", provider.id);
    formData.set("providerSlug", provider.slug);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as BookingSubmissionResult;
      setResult(data);
    } catch (error) {
      setResult({
        ok: false,
        message: locale === "ar" ? "تعذر إرسال الطلب حالياً." : "Impossible d'envoyer la demande pour le moment.",
      });
    } finally {
      setPending(false);
    }
  }

  if (result?.ok) {
    return (
      <div aria-live="polite" className="surface-card rounded-[1.75rem] p-6">
        <div className="status-pill status-pill--verified mb-4 inline-flex">{locale === "ar" ? "تم" : "OK"}</div>
        <h2 className={`text-2xl font-extrabold tracking-tight ${locale === "ar" ? "arabic-display" : ""}`}>{labels.successTitle}</h2>
        <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--muted)]">{labels.successDescription}</p>
        <p className="mt-3 text-sm text-[var(--muted)]">{result.message}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {result.whatsappUrl ? (
            <a href={result.whatsappUrl} target="_blank" rel="noreferrer" className="button-primary">
              {labels.openWhatsapp}
            </a>
          ) : null}
          <a href={`/${locale}/providers/${provider.slug}`} className="button-secondary">
            {locale === "ar" ? "العودة إلى الملف" : "Retour au profil"}
          </a>
        </div>
      </div>
    );
  }

  return (
    <form
      action={handleSubmit}
      aria-busy={pending}
      className="surface-card flex flex-col gap-5 rounded-[1.75rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(236,244,255,0.92))] p-6"
    >
      <div>
        <h2 className={`text-2xl font-extrabold tracking-tight ${locale === "ar" ? "arabic-display" : ""}`}>{titleLabel}</h2>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{labels.description}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{labels.fields.fullName} <span className="text-[var(--navy)]">*</span></span>
          <input name="customerName" required className="input-base" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{labels.fields.phoneNumber} <span className="text-[var(--navy)]">*</span></span>
          <input name="phoneNumber" required type="tel" className="input-base" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{labels.fields.selectedService} <span className="text-[var(--navy)]">*</span></span>
          <select name="selectedService" defaultValue={provider.categorySlug} className="input-base">
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name[locale]}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{labels.fields.zone} <span className="text-[var(--navy)]">*</span></span>
          <select name="zoneSlug" className="input-base" required>
            {providerZones.map((zone) => (
              <option key={zone.slug} value={zone.slug}>
                {zone.provinceName[locale]} • {zone.name[locale]}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{labels.fields.date} <span className="text-[var(--navy)]">*</span></span>
          <input name="date" type="date" min={minimumDate} required className="input-base" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{labels.fields.time} <span className="text-[var(--navy)]">*</span></span>
          <input name="time" type="time" required className="input-base" />
        </label>
      </div>

      <label>
        <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{labels.fields.address} <span className="text-[var(--navy)]">*</span></span>
        <input name="address" required className="input-base" />
      </label>

      <label>
        <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{labels.fields.mapsLink} <span className="text-[var(--navy)]">*</span></span>
        <input name="googleMapsUrl" type="url" required className="input-base" placeholder="https://maps.google.com/..." />
      </label>

      <label>
        <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{labels.fields.issueDescription} <span className="text-[var(--navy)]">*</span></span>
        <textarea name="issueDescription" required rows={5} className="input-base min-h-32 resize-y" />
      </label>

      {provider.profileType === "home_business" && provider.bulkOrders?.available ? (
        <section className="rounded-[1.5rem] border border-[rgba(20,92,255,0.14)] bg-[linear-gradient(180deg,rgba(214,230,255,0.72),rgba(255,255,255,0.95))] p-5">
          <div>
            <h3 className={`text-lg font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{labels.fields.businessBuyerTitle}</h3>
            <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{labels.fields.businessBuyerHint}</p>
          </div>
          <label className="mt-4 flex items-start gap-3 rounded-[1.25rem] border border-[rgba(15,95,255,0.12)] bg-white px-4 py-4">
            <input name="isBusinessBuyer" type="checkbox" className="mt-1 h-4 w-4 accent-[var(--accent)]" />
            <span className="text-sm font-semibold text-[var(--ink)]">{labels.fields.isBusinessBuyer}</span>
          </label>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{labels.fields.quantityNeeded}</span>
              <input name="quantityNeeded" className="input-base" />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{labels.fields.productionNeed}</span>
              <input name="productionNeed" className="input-base" />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{labels.fields.requestedLeadTime}</span>
              <input name="requestedLeadTime" className="input-base" />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{labels.fields.deliveryAreaNeeded}</span>
              <input name="deliveryAreaNeeded" className="input-base" />
            </label>
          </div>
        </section>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <label>
          <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{labels.fields.issuePhotos}</span>
          <input name="issuePhotos" type="file" accept="image/*" multiple className="input-base min-h-[unset] py-3" />
        </label>

        <label className="rounded-[1.25rem] border border-[rgba(15,95,255,0.12)] bg-white/90 p-4">
          <span className="mb-3 block text-sm font-semibold text-[var(--ink)]">{labels.fields.notificationOption}</span>
          <div className="flex items-start gap-3 text-sm text-[var(--muted)]">
            <input name="notificationRequested" type="checkbox" className="mt-1 h-4 w-4 accent-[var(--accent)]" />
            <span>{labels.fields.notificationHint}</span>
          </div>
        </label>
      </div>

      <label>
        <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{labels.fields.preferredContactMethod}</span>
        <select name="preferredContactMethod" className="input-base">
          <option value="whatsapp">WhatsApp</option>
          <option value="phone">{locale === "ar" ? "مكالمة هاتفية" : "Téléphone"}</option>
        </select>
      </label>

      {result?.message ? (
        <p
          role={result.ok ? "status" : "alert"}
          aria-live="polite"
          className={`text-sm font-medium ${result.ok ? "text-[var(--success)]" : "text-[var(--danger)]"}`}
        >
          {result.message}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className="button-primary w-full sm:w-fit">
        {pending ? (locale === "ar" ? "جارٍ الإرسال..." : "Envoi...") : submitLabel}
      </button>
    </form>
  );
}
