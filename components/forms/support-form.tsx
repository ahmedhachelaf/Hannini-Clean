"use client";

import Link from "next/link";
import { useState } from "react";
import type { Locale, SupportSubmissionResult } from "@/lib/types";
import { SupportFileUploader } from "./support-file-uploader";

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
    uploadLabel: string;
    uploadFormats: string;
    uploadMaxReached: string;
    uploadRemove: string;
    submitError: string;
    caseRef: string;
  };
};

export function SupportForm({ locale, defaultValues, labels }: SupportFormProps) {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<SupportSubmissionResult | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string>>>({});
  const [selectedCategory, setSelectedCategory] = useState(defaultValues?.category ?? "general_support");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [bookingMode, setBookingMode] = useState(defaultValues?.bookingId ? "with_booking" : "without_booking");

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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setResult(null);
    setFieldErrors({});

    try {
      const formData = new FormData(e.currentTarget);
      formData.set("locale", locale);
      // Remove any empty browser file input values and replace with the
      // state-managed files from the styled uploader.
      formData.delete("attachments");
      for (const file of attachedFiles) {
        formData.append("attachments", file);
      }

      const response = await fetch("/api/support", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as SupportSubmissionResult;

      if (!data.ok) {
        setFieldErrors(data.fields ?? {});
        setResult({
          ok: false,
          message: data.message || labels.submitError,
          code: data.code,
          fields: data.fields,
        });
      } else {
        setResult(data);
      }
    } catch {
      setResult({
        ok: false,
        message: labels.submitError,
      });
    } finally {
      setPending(false);
    }
  }

  // Full success screen
  if (result?.ok) {
    const caseRef = result.caseId ? result.caseId.slice(0, 6).toUpperCase() : null;
    return (
      <div
        className="surface-card flex flex-col items-center gap-5 rounded-[1.75rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(231,240,255,0.94))] p-8 text-center"
        style={{ animation: "fadeSlideUp 0.3s ease both" }}
      >
        <style>{`@keyframes fadeSlideUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-3xl">✅</div>
        <div>
          <h2 className={`text-2xl font-extrabold text-[var(--ink)] ${locale === "ar" ? "arabic-display" : ""}`}>
            {labels.successTitle}
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-7 text-[var(--muted)]">{labels.successDescription}</p>
        </div>
        {caseRef && (
          <div className="rounded-[1rem] border border-[var(--line)] bg-[var(--soft)] px-5 py-3 text-sm">
            <span className="text-[var(--muted)]">{labels.caseRef} </span>
            <span className="font-mono font-bold text-[var(--ink)]">#{caseRef}</span>
          </div>
        )}
        {result.caseId && !result.demoMode ? (
          <Link href={`/${locale}/support/${result.caseId}`} className="button-primary mt-2">
            {labels.openThread}
          </Link>
        ) : (
          <Link href={`/${locale}`} className="button-primary mt-2">
            {locale === "ar" ? "العودة إلى الرئيسية" : "Retour à l'accueil"}
          </Link>
        )}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="surface-card flex flex-col gap-5 rounded-[1.75rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(231,240,255,0.94))] p-6"
    >
      <input type="hidden" name="locale" value={locale} />
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
          <select name="actorRole" defaultValue={defaultValues?.actorRole ?? "customer"} disabled={pending} className="input-base">
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
            disabled={pending}
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
          disabled={pending}
          className="input-base"
          placeholder={locale === "ar" ? "مثال: تواصل غير مناسب بعد الحجز" : "Exemple : contact inapproprié après réservation"}
        />
        {fieldErrors.subject ? <p className="mt-1 text-xs text-rose-600">{fieldErrors.subject}</p> : null}
      </label>

      <label>
        <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">
          {labels.messageLabel} <span className="text-[var(--navy)]">• {locale === "ar" ? "مطلوب" : "Obligatoire"}</span>
        </span>
        <textarea
          name="message"
          required
          rows={6}
          disabled={pending}
          className="input-base min-h-36 resize-y"
          placeholder={
            locale === "ar"
              ? "اكتب ما حدث، متى حصل، ومن هو الطرف المعني، وما الذي تحتاجه من الإدارة الآن."
              : "Expliquez ce qui s'est passé, quand, avec qui, et ce que vous attendez de l'équipe maintenant."
          }
        />
        {fieldErrors.message ? <p className="mt-1 text-xs text-rose-600">{fieldErrors.message}</p> : null}
      </label>

      <div className="rounded-[1.25rem] border border-[var(--line)] bg-[var(--soft)] px-4 py-4 text-sm leading-7 text-[var(--muted)]">
        {locale === "ar"
          ? "نحتاج اسمك ورقم هاتفك للتواصل معك بسرعة عند الحاجة."
          : "Nous avons besoin de votre nom et téléphone pour vous contacter rapidement si besoin."}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">
            {locale === "ar" ? "اسمك الكامل" : "Votre nom"} <span className="text-[var(--navy)]">• {locale === "ar" ? "مطلوب" : "Obligatoire"}</span>
          </span>
          <input name="reporterName" required disabled={pending} className="input-base" />
          {fieldErrors.reporterName ? <p className="mt-1 text-xs text-rose-600">{fieldErrors.reporterName}</p> : null}
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">
            {labels.phoneLabel} <span className="text-[var(--navy)]">• {locale === "ar" ? "مطلوب" : "Obligatoire"}</span>
          </span>
          <input name="phoneNumber" type="tel" required disabled={pending} className="input-base" />
          {fieldErrors.phoneNumber ? <p className="mt-1 text-xs text-rose-600">{fieldErrors.phoneNumber}</p> : null}
        </label>
      </div>

      <label>
        <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{labels.emailLabel}</span>
        <input name="email" type="email" disabled={pending} className="input-base" />
        {fieldErrors.email ? <p className="mt-1 text-xs text-rose-600">{fieldErrors.email}</p> : null}
      </label>

      <div className="rounded-[1.25rem] border border-[var(--line)] bg-white p-4">
        <div className="text-sm font-semibold text-[var(--ink)]">{locale === "ar" ? "هل لديك رقم حجز؟" : "Avez-vous un numéro de réservation ?"}</div>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <button
            type="button"
            onClick={() => setBookingMode("with_booking")}
            className={`rounded-full border px-4 py-2 ${bookingMode === "with_booking" ? "border-terracotta bg-terracotta-pale text-terracotta" : "border-[var(--line)] bg-white text-[var(--muted)]"}`}
          >
            {locale === "ar" ? "نعم، لدي رقم الحجز" : "Oui, j'ai un numéro"}
          </button>
          <button
            type="button"
            onClick={() => setBookingMode("without_booking")}
            className={`rounded-full border px-4 py-2 ${bookingMode === "without_booking" ? "border-terracotta bg-terracotta-pale text-terracotta" : "border-[var(--line)] bg-white text-[var(--muted)]"}`}
          >
            {locale === "ar" ? "لا، أبلّغ بدون حجز" : "Non, pas de réservation"}
          </button>
        </div>
        {bookingMode === "with_booking" ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">
                {locale === "ar" ? "رقم الحجز أو رقم الهاتف المستخدم" : "Référence ou téléphone utilisé"}
              </span>
              <input name="bookingReference" defaultValue={defaultValues?.bookingId ?? ""} disabled={pending} className="input-base" />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{labels.providerReferenceLabel}</span>
              <input name="providerSlug" defaultValue={defaultValues?.providerSlug ?? ""} disabled={pending} className="input-base" />
            </label>
          </div>
        ) : (
          <div className="mt-4">
            <label>
              <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{labels.providerReferenceLabel}</span>
              <input name="providerSlug" defaultValue={defaultValues?.providerSlug ?? ""} disabled={pending} className="input-base" />
            </label>
          </div>
        )}
      </div>

      <input type="hidden" name="providerId" value={defaultValues?.providerId ?? ""} />

      <div>
        <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{labels.attachmentsLabel}</span>
        <SupportFileUploader
          files={attachedFiles}
          onFilesChange={setAttachedFiles}
          labels={{
            uploadLabel: labels.uploadLabel,
            uploadFormats: labels.uploadFormats,
            uploadMaxReached: labels.uploadMaxReached,
            uploadRemove: labels.uploadRemove,
          }}
        />
      </div>

      <div className="grid gap-4 rounded-[1.5rem] border border-[rgba(15,95,255,0.14)] bg-[var(--soft)] p-5 md:grid-cols-2">
        <label className="rounded-[1.25rem] border border-[rgba(15,95,255,0.12)] bg-white px-4 py-4">
          <div className="flex items-start gap-3">
            <input name="blockContact" type="checkbox" disabled={pending} className="mt-1 h-4 w-4 accent-[var(--accent)]" />
            <div>
              <div className="text-sm font-semibold text-[var(--ink)]">{labels.safetyBlockLabel}</div>
              <div className="mt-1 text-xs leading-6 text-[var(--muted)]">{labels.safetyBlockHint}</div>
            </div>
          </div>
        </label>
        <label className="rounded-[1.25rem] border border-[rgba(15,95,255,0.12)] bg-white px-4 py-4">
          <div className="flex items-start gap-3">
            <input name="isSensitive" type="checkbox" disabled={pending} className="mt-1 h-4 w-4 accent-[var(--accent)]" />
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
