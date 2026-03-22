"use client";

import { useState } from "react";
import type { Locale, SupportSubmissionResult } from "@/lib/types";

type SupportFormProps = {
  locale: Locale;
  defaultValues?: {
    actorRole?: "customer" | "provider";
    category?: string;
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
    safetyBlockLabel: string;
    safetyBlockHint: string;
    privacySensitiveLabel: string;
    privacySensitiveHint: string;
    safetyNoteTitle: string;
    safetyNoteBody: string;
    categories: Record<string, string>;
    successTitle: string;
    successDescription: string;
    openThread: string;
  };
};

export function SupportForm({ locale, defaultValues, labels }: SupportFormProps) {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<SupportSubmissionResult | null>(null);
  const [selectedCategory, setSelectedCategory] = useState(defaultValues?.category ?? "general_support");
  const categoryHints = {
    harassment:
      locale === "ar"
        ? "استخدم هذا الخيار إذا كان هناك كلام مسيء، ضغط، أو سلوك شخصي غير مقبول."
        : "Utilisez cette catégorie en cas de paroles déplacées, pression ou comportement personnel inacceptable.",
    unsafe_behavior:
      locale === "ar"
        ? "للحالات التي تشعر فيها أن التواصل أو اللقاء أو الترتيب غير آمن."
        : "Pour les situations où l'échange, la rencontre ou l'organisation vous semble peu sûre.",
    fraud_or_scam:
      locale === "ar"
        ? "إذا شككت في احتيال، طلب غير طبيعي، أو محاولة استغلال مالي."
        : "Si vous suspectez une fraude, une demande anormale ou une tentative d'arnaque.",
    inappropriate_contact:
      locale === "ar"
        ? "إذا كان التواصل متكرراً بشكل مزعج أو خرج عن إطار الخدمة."
        : "Si le contact devient insistant, gênant ou sort du cadre du service.",
    provider_report:
      locale === "ar"
        ? "للإبلاغ عن مزود أو نشاط معين مع مرجع واضح."
        : "Pour signaler un prestataire ou une activité précise avec une référence claire.",
    general_support:
      locale === "ar"
        ? "لأي مساعدة عامة أو مشكلة لا تدخل في الفئات السابقة."
        : "Pour toute aide générale ou un problème qui n'entre pas dans les autres catégories.",
  };

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
        <h2 className={`text-3xl font-extrabold tracking-tight ${locale === "ar" ? "arabic-display" : ""}`}>{labels.title}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)]">{labels.description}</p>
        <div className="mt-4 rounded-[1.25rem] border border-[rgba(20,92,255,0.14)] bg-[var(--soft)] px-4 py-3 text-sm leading-7 text-[var(--muted)]">
          {categoryHints[selectedCategory as keyof typeof categoryHints] ??
            (locale === "ar"
              ? "اشرح المشكلة بوضوح قصير، وأضف المرجع أو الصورة فقط إذا كانت تساعد الإدارة على الفهم."
              : "Expliquez le problème clairement en quelques lignes et ajoutez une référence ou une image seulement si cela aide l'équipe à comprendre.")}
        </div>
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
          <select
            name="category"
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
            className="input-base"
          >
            {Object.entries(labels.categories).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label>
        <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">
          {labels.subjectLabel} <span className="text-[var(--navy)]">• {locale === "ar" ? "مطلوب" : "Obligatoire"}</span>
        </span>
        <input
          name="subject"
          required
          className="input-base"
          placeholder={locale === "ar" ? "مثال: تواصل غير مناسب بعد الحجز" : "Exemple : contact inapproprié après réservation"}
        />
      </label>

      <label>
        <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">
          {labels.messageLabel} <span className="text-[var(--navy)]">• {locale === "ar" ? "مطلوب" : "Obligatoire"}</span>
        </span>
        <textarea
          name="message"
          required
          rows={6}
          className="input-base min-h-36 resize-y"
          placeholder={
            locale === "ar"
              ? "اكتب ما حدث، متى حصل، ومن هو الطرف المعني، وما الذي تحتاجه من الإدارة الآن."
              : "Expliquez ce qui s'est passé, quand, avec qui, et ce que vous attendez de l'équipe maintenant."
          }
        />
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

      <div className="grid gap-4 rounded-[1.5rem] border border-[rgba(15,95,255,0.14)] bg-[var(--soft)] p-5 md:grid-cols-2">
        <label className="rounded-[1.25rem] border border-[rgba(15,95,255,0.12)] bg-white px-4 py-4">
          <div className="flex items-start gap-3">
            <input name="requestSafetyBlock" type="checkbox" className="mt-1 h-4 w-4 accent-[var(--accent)]" />
            <div>
              <div className="text-sm font-semibold text-[var(--ink)]">{labels.safetyBlockLabel}</div>
              <div className="mt-1 text-xs leading-6 text-[var(--muted)]">{labels.safetyBlockHint}</div>
            </div>
          </div>
        </label>
        <label className="rounded-[1.25rem] border border-[rgba(15,95,255,0.12)] bg-white px-4 py-4">
          <div className="flex items-start gap-3">
            <input name="privacySensitive" type="checkbox" className="mt-1 h-4 w-4 accent-[var(--accent)]" />
            <div>
              <div className="text-sm font-semibold text-[var(--ink)]">{labels.privacySensitiveLabel}</div>
              <div className="mt-1 text-xs leading-6 text-[var(--muted)]">{labels.privacySensitiveHint}</div>
            </div>
          </div>
        </label>
      </div>

      <div className="rounded-[1.5rem] border border-[rgba(20,92,255,0.14)] bg-[linear-gradient(180deg,rgba(214,230,255,0.72),rgba(255,255,255,0.96))] px-5 py-5 text-sm leading-7 text-[var(--muted)]">
        <div className="font-semibold text-[var(--ink)]">{labels.safetyNoteTitle}</div>
        <div className="mt-2">{labels.safetyNoteBody}</div>
      </div>

      {result?.ok ? (
        <div role="status" aria-live="polite" className="rounded-[1.25rem] border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
          <div className="font-semibold">{labels.successTitle}</div>
          <div className="mt-1">{labels.successDescription}</div>
          {result.caseId ? (
            <a href={`/${locale}/support/${result.caseId}`} className="button-primary mt-4 inline-flex">
              {labels.openThread}
            </a>
          ) : null}
        </div>
      ) : null}

      {result?.message && !result.ok ? (
        <p role="alert" aria-live="polite" className="text-sm font-medium text-rose-700">
          {result.message}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className="button-primary w-full sm:w-fit">
        {pending ? (locale === "ar" ? "جارٍ الإرسال..." : "Envoi...") : locale === "ar" ? "إرسال الطلب" : "Envoyer la demande"}
      </button>
    </form>
  );
}
