"use client";

import { useState } from "react";
import type { Category, Locale, SignupSubmissionResult, Zone } from "@/lib/types";

type ProviderSignupFormProps = {
  locale: Locale;
  categories: Category[];
  zones: Zone[];
  labels: {
    title: string;
    description: string;
    successTitle: string;
    successDescription: string;
  };
};

const weekdays = [
  { value: "sat", ar: "السبت", fr: "Samedi" },
  { value: "sun", ar: "الأحد", fr: "Dimanche" },
  { value: "mon", ar: "الاثنين", fr: "Lundi" },
  { value: "tue", ar: "الثلاثاء", fr: "Mardi" },
  { value: "wed", ar: "الأربعاء", fr: "Mercredi" },
  { value: "thu", ar: "الخميس", fr: "Jeudi" },
];

const languageChoices = [
  { value: "العربية", ar: "العربية", fr: "Arabe" },
  { value: "Français", ar: "الفرنسية", fr: "Français" },
];

export function ProviderSignupForm({ locale, categories, zones, labels }: ProviderSignupFormProps) {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<SignupSubmissionResult | null>(null);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setResult(null);

    try {
      const response = await fetch("/api/provider-signups", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as SignupSubmissionResult;
      setResult(data);
    } catch (error) {
      setResult({
        ok: false,
        message: locale === "ar" ? "تعذر إرسال الطلب حالياً." : "Impossible d'envoyer la candidature pour le moment.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={handleSubmit} className="surface-card flex flex-col gap-6 rounded-[1.75rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(232,242,255,0.94))] p-6">
      <div>
        <h2 className={`text-2xl font-extrabold tracking-tight ${locale === "ar" ? "arabic-display" : ""}`}>{labels.title}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">{labels.description}</p>
        <div className="mt-4 rounded-[1.25rem] border border-[rgba(20,92,255,0.14)] bg-[var(--soft)] px-4 py-3 text-sm leading-7 text-[var(--muted)]">
          {locale === "ar"
            ? "بعد الإرسال، يظهر الطلب في لوحة الإدارة بحالة pending للمراجعة اليدوية. لا يتم إرسال بريد إلكتروني تلقائي حالياً."
            : "Apres envoi, la candidature apparait en admin avec le statut pending pour revue manuelle. Aucun email automatique n'est envoye pour le moment."}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{locale === "ar" ? "الاسم الكامل" : "Nom complet"}</span>
          <input name="fullName" required className="input-base" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{locale === "ar" ? "اسم الورشة" : "Nom de l'atelier"}</span>
          <input name="workshopName" className="input-base" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{locale === "ar" ? "رقم الهاتف" : "Téléphone"}</span>
          <input name="phoneNumber" type="tel" required className="input-base" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">WhatsApp</span>
          <input name="whatsappNumber" type="tel" required className="input-base" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{locale === "ar" ? "فئة الخدمة" : "Catégorie"}</span>
          <select name="categorySlug" required className="input-base">
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name[locale]}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{locale === "ar" ? "سنوات الخبرة" : "Années d'expérience"}</span>
          <input name="yearsExperience" type="number" min={0} required className="input-base" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{locale === "ar" ? "السعر بالساعة" : "Tarif horaire"}</span>
          <input name="hourlyRate" type="number" min={0} required className="input-base" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{locale === "ar" ? "رسوم التنقل" : "Frais de déplacement"}</span>
          <input name="travelFee" type="number" min={0} required className="input-base" />
        </label>
      </div>

      <label>
        <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{locale === "ar" ? "وصف قصير" : "Description courte"}</span>
        <textarea name="shortDescription" required rows={5} className="input-base min-h-32 resize-y" />
      </label>

      <label>
        <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">Google Maps</span>
        <input name="googleMapsUrl" type="url" required className="input-base" placeholder="https://maps.google.com/..." />
      </label>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-[var(--muted)]">{locale === "ar" ? "المناطق التي تخدمها" : "Zones desservies"}</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {zones.map((zone) => (
            <label key={zone.slug} className="flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-white px-4 py-3">
              <input type="checkbox" name="zones" value={zone.slug} className="h-4 w-4" />
              <span>{zone.name[locale]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-[var(--muted)]">{locale === "ar" ? "اللغات" : "Langues"}</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {languageChoices.map((language) => (
            <label key={language.value} className="flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-white px-4 py-3">
              <input type="checkbox" name="languages" value={language.value} defaultChecked={language.value === "العربية"} className="h-4 w-4" />
              <span>{locale === "ar" ? language.ar : language.fr}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-3">
        <label>
          <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{locale === "ar" ? "بداية العمل" : "Début"}</span>
          <input name="startTime" type="time" required className="input-base" defaultValue="08:00" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{locale === "ar" ? "نهاية العمل" : "Fin"}</span>
          <input name="endTime" type="time" required className="input-base" defaultValue="18:00" />
        </label>
        <div className="rounded-[1.25rem] border border-dashed border-[var(--line)] bg-white p-4 text-sm leading-6 text-[var(--muted)]">
          {locale === "ar"
            ? "نلتقط أسماء الملفات حالياً للمراجعة اليدوية ضمن نسخة MVP."
            : "Le MVP capture actuellement les noms de fichiers pour une revue manuelle."}
        </div>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-[var(--muted)]">{locale === "ar" ? "أيام العمل" : "Jours travaillés"}</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {weekdays.map((day) => (
            <label key={day.value} className="flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-white px-4 py-3">
              <input type="checkbox" name="weekdays" value={day.value} className="h-4 w-4" />
              <span>{locale === "ar" ? day.ar : day.fr}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-3">
        <label>
          <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{locale === "ar" ? "الصورة الشخصية أو الشعار" : "Photo ou logo"}</span>
          <input name="profilePhoto" type="file" accept="image/*" className="input-base py-3" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{locale === "ar" ? "صور الأعمال" : "Photos de travaux"}</span>
          <input name="workPhotos" type="file" accept="image/*" multiple className="input-base py-3" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{locale === "ar" ? "وثيقة التحقق" : "Document de vérification"}</span>
          <input name="verificationDocument" type="file" className="input-base py-3" />
        </label>
      </div>

      {result ? (
        <div className={`rounded-2xl border px-4 py-3 text-sm ${result.ok ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
          <div className="font-semibold">{result.ok ? labels.successTitle : locale === "ar" ? "تعذر الإرسال" : "Envoi impossible"}</div>
          <div className="mt-1">{result.ok ? result.message : result.message}</div>
        </div>
      ) : null}

      <button type="submit" disabled={pending} className="button-primary w-full sm:w-fit">
        {pending ? (locale === "ar" ? "جارٍ الإرسال..." : "Envoi...") : locale === "ar" ? "إرسال الطلب" : "Envoyer la candidature"}
      </button>
    </form>
  );
}
