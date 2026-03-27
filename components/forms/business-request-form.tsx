"use client";

import { useRef, useState } from "react";
import { WilayaSelect } from "@/components/WilayaSelect";
import { isValidAlgerianPhone, normalizeAlgerianPhone } from "@/lib/phone";
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

type FormErrors = Partial<Record<string, string>>;

export function BusinessRequestForm({ locale, categories, labels }: BusinessRequestFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<BusinessRequestSubmissionResult | null>(null);
  const [wilayaCode, setWilayaCode] = useState("");
  const [commune, setCommune] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [showOptional, setShowOptional] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  function clearFieldError(field: string) {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function scrollToField(field: string) {
    const target = formRef.current?.querySelector(`[data-field='${field}']`);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function validate(formData: FormData) {
    const nextErrors: FormErrors = {};
    const companyName = String(formData.get("companyName") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const categorySlug = String(formData.get("categorySlug") ?? "").trim();
    const passwordValue = String(formData.get("password") ?? "");
    const passwordConfirmValue = String(formData.get("passwordConfirmation") ?? "");
    const consentAccepted = String(formData.get("consentAccepted") ?? "") === "on";

    if (companyName.length < 2) {
      nextErrors.companyName = locale === "ar" ? "يرجى إدخال اسم النشاط." : "Merci de saisir le nom de l’activité.";
    }

    if (!phone || !isValidAlgerianPhone(phone)) {
      nextErrors.phone = locale === "ar" ? "يرجى إدخال رقم هاتف صالح." : "Veuillez saisir un numéro valide.";
    }

    if (!categorySlug) {
      nextErrors.categorySlug = locale === "ar" ? "يرجى اختيار الفئة." : "Veuillez choisir la catégorie.";
    }

    if (!wilayaCode) {
      nextErrors.wilayaCode = locale === "ar" ? "يرجى اختيار الولاية." : "Veuillez choisir la wilaya.";
    }

    if (!commune) {
      nextErrors.commune = locale === "ar" ? "يرجى اختيار البلدية." : "Veuillez choisir la commune.";
    }

    if (passwordValue.length < 8) {
      nextErrors.password = locale === "ar" ? "كلمة المرور يجب أن تكون 8 أحرف على الأقل." : "Mot de passe: 8 caractères minimum.";
    }

    if (passwordValue !== passwordConfirmValue) {
      nextErrors.passwordConfirmation = locale === "ar" ? "تأكيد كلمة المرور غير مطابق." : "La confirmation ne correspond pas.";
    }

    if (!consentAccepted) {
      nextErrors.consentAccepted = locale === "ar" ? "يرجى الموافقة على الشروط." : "Merci d’accepter les conditions.";
    }

    return nextErrors;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(null);

    const formData = new FormData(event.currentTarget);
    formData.set("wilayaCode", wilayaCode);
    formData.set("commune", commune);
    formData.set("phone", normalizeAlgerianPhone(String(formData.get("phone") ?? "")));

    const nextErrors = validate(formData);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      scrollToField(Object.keys(nextErrors)[0]);
      return;
    }

    setErrors({});
    setPending(true);

    try {
      const response = await fetch("/api/business-requests", {
        method: "POST",
        body: formData,
      });
      const raw = await response.text();
      const data = raw ? (JSON.parse(raw) as BusinessRequestSubmissionResult) : null;
      setResult(data ?? { ok: false, message: locale === "ar" ? "تعذر إرسال الطلب حالياً." : "Impossible d'envoyer la demande." });
    } catch {
      setResult({
        ok: false,
        message: locale === "ar" ? "تعذر إرسال الطلب حالياً." : "Impossible d'envoyer la demande.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <form ref={formRef} noValidate onSubmit={handleSubmit} className="surface-card flex flex-col gap-5 rounded-[1.75rem] bg-white p-6">
      <input type="hidden" name="locale" value={locale} />

      <div>
        <h2 className={`text-3xl font-extrabold tracking-tight ${locale === "ar" ? "arabic-display" : ""}`}>{labels.title}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)]">{labels.description}</p>
      </div>

      <section className="rounded-[0.75rem] border border-[var(--line)] bg-white p-6">
        <div className="mb-4 border-b border-[var(--line)] pb-3 text-base font-bold text-terracotta">
          {locale === "ar" ? "المعلومات الأساسية" : "Informations essentielles"}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label data-field="companyName">
            <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">
              {labels.companyName} <span className="text-terracotta">• {locale === "ar" ? "مطلوب" : "Obligatoire"}</span>
            </span>
            <input name="companyName" className={`input-base ${errors.companyName ? "border-rose-300" : ""}`} onChange={() => clearFieldError("companyName")} />
            {errors.companyName ? <p className="mt-1 text-xs text-rose-600">{errors.companyName}</p> : null}
          </label>
          <label data-field="phone">
            <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">
              {labels.phone} <span className="text-terracotta">• {locale === "ar" ? "مطلوب" : "Obligatoire"}</span>
            </span>
            <input
              name="phone"
              type="tel"
              className={`input-base ${errors.phone ? "border-rose-300" : ""}`}
              placeholder="05XXXXXXXX"
              onChange={() => clearFieldError("phone")}
            />
            {errors.phone ? <p className="mt-1 text-xs text-rose-600">{errors.phone}</p> : null}
          </label>
          <label data-field="categorySlug">
            <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">
              {labels.category} <span className="text-terracotta">• {locale === "ar" ? "مطلوب" : "Obligatoire"}</span>
            </span>
            <select
              name="categorySlug"
              className={`input-base ${errors.categorySlug ? "border-rose-300" : ""}`}
              defaultValue={categories[0]?.slug ?? ""}
              onChange={() => clearFieldError("categorySlug")}
            >
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name[locale]}
                </option>
              ))}
            </select>
            {errors.categorySlug ? <p className="mt-1 text-xs text-rose-600">{errors.categorySlug}</p> : null}
          </label>
          <div data-field="wilayaCode">
            <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">
              {labels.wilaya} <span className="text-terracotta">• {locale === "ar" ? "مطلوب" : "Obligatoire"}</span>
            </span>
            <WilayaSelect
              locale={locale}
              required
              onWilayaChange={(code) => {
                setWilayaCode(code);
                clearFieldError("wilayaCode");
              }}
              onCommuneChange={(value) => {
                setCommune(value);
                clearFieldError("commune");
              }}
            />
            <input type="hidden" name="wilayaCode" value={wilayaCode} />
            <input type="hidden" name="commune" value={commune} />
            {errors.wilayaCode ? <p className="mt-1 text-xs text-rose-600">{errors.wilayaCode}</p> : null}
            {errors.commune ? <p className="mt-1 text-xs text-rose-600">{errors.commune}</p> : null}
          </div>
        </div>
      </section>

      <section className="rounded-[0.75rem] border border-[var(--line)] bg-white p-6">
        <div className="mb-4 border-b border-[var(--line)] pb-3 text-base font-bold text-terracotta">
          {locale === "ar" ? "حماية الحساب" : "Protection du compte"}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label data-field="password">
            <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">
              {locale === "ar" ? "كلمة المرور" : "Mot de passe"} <span className="text-terracotta">• {locale === "ar" ? "مطلوب" : "Obligatoire"}</span>
            </span>
            <input
              name="password"
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                clearFieldError("password");
              }}
              className={`input-base ${errors.password ? "border-rose-300" : ""}`}
            />
            {errors.password ? <p className="mt-1 text-xs text-rose-600">{errors.password}</p> : null}
          </label>
          <label data-field="passwordConfirmation">
            <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">
              {locale === "ar" ? "تأكيد كلمة المرور" : "Confirmation"} <span className="text-terracotta">• {locale === "ar" ? "مطلوب" : "Obligatoire"}</span>
            </span>
            <input
              name="passwordConfirmation"
              type="password"
              value={passwordConfirmation}
              onChange={(event) => {
                setPasswordConfirmation(event.target.value);
                clearFieldError("passwordConfirmation");
              }}
              className={`input-base ${errors.passwordConfirmation ? "border-rose-300" : ""}`}
            />
            {errors.passwordConfirmation ? <p className="mt-1 text-xs text-rose-600">{errors.passwordConfirmation}</p> : null}
          </label>
        </div>
      </section>

      <section className="rounded-[0.75rem] border border-[var(--line)] bg-white p-6">
        <button
          type="button"
          onClick={() => setShowOptional((current) => !current)}
          className="flex w-full items-center justify-between text-base font-bold text-terracotta"
        >
          <span>{locale === "ar" ? "تفاصيل إضافية (اختياري) ▾" : "Détails supplémentaires (optionnel) ▾"}</span>
          <span className={`transition ${showOptional ? "rotate-180" : ""}`}>▾</span>
        </button>
        {showOptional ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{labels.email}</span>
              <input name="email" type="email" className="input-base" placeholder="example@email.com" />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{locale === "ar" ? "واتساب" : "WhatsApp"}</span>
              <input name="whatsappNumber" type="tel" className="input-base" placeholder="05XXXXXXXX" />
            </label>
            <label className="sm:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{labels.descriptionField}</span>
              <textarea name="description" rows={4} className="input-base min-h-28 resize-y" />
            </label>
            <label className="sm:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">
                {locale === "ar" ? "الموقع الإلكتروني" : "Site web"}
              </span>
              <input name="websiteUrl" type="url" className="input-base" />
            </label>
            <label className="sm:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">
                {locale === "ar" ? "رابط خرائط غوغل" : "Lien Google Maps"}
              </span>
              <input name="googleMapsUrl" type="url" className="input-base" />
            </label>
            <label className="sm:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{labels.attachment}</span>
              <input name="attachments" type="file" className="input-base py-3" />
            </label>
          </div>
        ) : null}
      </section>

      <section className="rounded-[0.75rem] border border-[var(--line)] bg-[var(--soft)] p-5" data-field="consentAccepted">
        <label className="flex items-start gap-3">
          <input
            name="consentAccepted"
            type="checkbox"
            className="mt-1 h-4 w-4 accent-terracotta"
            onChange={() => clearFieldError("consentAccepted")}
          />
          <div>
            <div className="text-sm font-semibold text-[var(--ink)]">
              {labels.consent} <span className="text-terracotta">• {locale === "ar" ? "مطلوب" : "Obligatoire"}</span>
            </div>
            <div className="mt-1 text-xs leading-6 text-[var(--muted)]">{labels.helper}</div>
          </div>
        </label>
        {errors.consentAccepted ? <p className="mt-2 text-xs text-rose-600">{errors.consentAccepted}</p> : null}
      </section>

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

      <button type="submit" disabled={pending} className="button-primary w-full sm:w-fit">
        {pending ? (locale === "ar" ? "جارٍ الإرسال..." : "Envoi...") : labels.submit}
      </button>
    </form>
  );
}
