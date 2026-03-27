"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { WilayaSelect } from "@/components/WilayaSelect";
import { isValidAlgerianPhone, normalizeAlgerianPhone } from "@/lib/phone";
import type { Category, Locale, ProfileType, SignupSubmissionResult, Zone } from "@/lib/types";

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

type FormErrors = Partial<Record<string, string>>;

type FormCopy = {
  required: string;
  contactTitle: string;
  activityTitle: string;
  identityTitle: string;
  optionalTitle: string;
  optionalHint: string;
  fullName: string;
  phone: string;
  category: string;
  wilaya: string;
  commune: string;
  password: string;
  passwordConfirmation: string;
  termsTitle: string;
  termsAge: string;
  termsConduct: string;
  termsPolicy: string;
  termsHint: string;
  optionalToggle: string;
  email: string;
  whatsapp: string;
  shortDescription: string;
  yearsExperience: string;
  maps: string;
  workPhotos: string;
  verificationDocument: string;
  submit: string;
  pendingHint: string;
  submissionError: string;
};

function getCopy(locale: Locale): FormCopy {
  if (locale === "ar") {
    return {
      required: "مطلوب",
      contactTitle: "معلومات التواصل",
      activityTitle: "نشاطك المهني",
      identityTitle: "الهوية",
      optionalTitle: "تفاصيل إضافية (اختياري)",
      optionalHint: "أضف هذه التفاصيل لتحسين الثقة والظهور. كلها اختيارية.",
      fullName: "الاسم الكامل أو اسم النشاط",
      phone: "رقم الهاتف",
      category: "الفئة المهنية",
      wilaya: "الولاية",
      commune: "البلدية",
      password: "كلمة المرور",
      passwordConfirmation: "تأكيد كلمة المرور",
      termsTitle: "الموافقة على الشروط",
      termsAge: "أؤكد أن عمري 16 سنة أو أكثر",
      termsConduct: "أوافق على قواعد السلوك والأمان في هَنّيني",
      termsPolicy: "اطّلعت على الشروط والسياسات ذات الصلة وأوافق عليها",
      termsHint: "هذه الموافقات ضرورية للحفاظ على سلامة المجتمع.",
      optionalToggle: "أضف تفاصيل إضافية لتعزيز ملفك (اختياري) ▾",
      email: "البريد الإلكتروني (اختياري)",
      whatsapp: "رقم واتساب (اختياري)",
      shortDescription: "نبذة مختصرة (اختياري)",
      yearsExperience: "سنوات الخبرة (اختياري)",
      maps: "رابط خرائط غوغل (اختياري)",
      workPhotos: "صور الأعمال (اختياري)",
      verificationDocument: "وثيقة التحقق (اختياري)",
      submit: "إرسال طلب الانضمام",
      pendingHint: "بعد الإرسال سيظهر الطلب في لوحة الإدارة بحالة قيد المراجعة.",
      submissionError: "تعذر إرسال الطلب حالياً.",
    };
  }

  return {
    required: "Obligatoire",
    contactTitle: "Coordonnées",
    activityTitle: "Votre activité",
    identityTitle: "Identité",
    optionalTitle: "Détails complémentaires (optionnel)",
    optionalHint: "Ajoutez ces détails pour renforcer la confiance. Tout est optionnel.",
    fullName: "Nom complet ou nom de l’activité",
    phone: "Téléphone",
    category: "Catégorie",
    wilaya: "Wilaya",
    commune: "Commune",
    password: "Mot de passe",
    passwordConfirmation: "Confirmer le mot de passe",
    termsTitle: "Acceptation des conditions",
    termsAge: "Je confirme avoir 16 ans ou plus",
    termsConduct: "J’accepte le code de conduite et sécurité Hannini",
    termsPolicy: "J’ai lu les conditions et politiques applicables",
    termsHint: "Ces confirmations sont obligatoires pour un environnement sûr.",
    optionalToggle: "Ajouter des détails pour renforcer le profil (optionnel) ▾",
    email: "E-mail (optionnel)",
    whatsapp: "WhatsApp (optionnel)",
    shortDescription: "Courte description (optionnel)",
    yearsExperience: "Années d’expérience (optionnel)",
    maps: "Lien Google Maps (optionnel)",
    workPhotos: "Photos de réalisations (optionnel)",
    verificationDocument: "Document de vérification (optionnel)",
    submit: "Envoyer la candidature",
    pendingHint: "Après envoi, votre dossier passe en revue manuelle.",
    submissionError: "Impossible d'envoyer la candidature pour le moment.",
  };
}

export function ProviderSignupForm({ locale, categories, labels }: ProviderSignupFormProps) {
  const copy = getCopy(locale);
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<SignupSubmissionResult | null>(null);
  const [profileType, setProfileType] = useState<ProfileType>("service_provider");
  const [wilayaCode, setWilayaCode] = useState("");
  const [commune, setCommune] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [showOptional, setShowOptional] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const laneCategories = useMemo(
    () => categories.filter((category) => category.lane === profileType),
    [categories, profileType],
  );

  function setFieldError(field: string, message: string) {
    setErrors((prev) => ({ ...prev, [field]: message }));
  }

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
    const fullName = String(formData.get("fullName") ?? "").trim();
    const phoneNumber = String(formData.get("phoneNumber") ?? "").trim();
    const categorySlug = String(formData.get("categorySlug") ?? "").trim();
    const passwordValue = String(formData.get("password") ?? "");
    const passwordConfirmValue = String(formData.get("passwordConfirmation") ?? "");
    const ageConfirmed = String(formData.get("ageConfirmed") ?? "") === "on";
    const conductAccepted = String(formData.get("conductAccepted") ?? "") === "on";
    const policyAccepted = String(formData.get("policyAccepted") ?? "") === "on";

    if (fullName.length < 3) {
      nextErrors.fullName = locale === "ar" ? "يرجى إدخال الاسم الكامل." : "Merci de saisir votre nom complet.";
    }

    if (!phoneNumber || !isValidAlgerianPhone(phoneNumber)) {
      nextErrors.phoneNumber =
        locale === "ar" ? "يرجى إدخال رقم هاتف جزائري صالح." : "Veuillez saisir un numéro algérien valide.";
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

    if (!ageConfirmed) {
      nextErrors.ageConfirmed = locale === "ar" ? "يرجى تأكيد العمر." : "Veuillez confirmer votre âge.";
    }

    if (!conductAccepted) {
      nextErrors.conductAccepted = locale === "ar" ? "يجب الموافقة على قواعد السلوك." : "Merci d’accepter le code de conduite.";
    }

    if (!policyAccepted) {
      nextErrors.policyAccepted = locale === "ar" ? "يجب الموافقة على الشروط." : "Merci d’accepter les conditions.";
    }

    return nextErrors;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(null);

    const formData = new FormData(event.currentTarget);
    formData.set("profileType", profileType);
    formData.set("wilayaCode", wilayaCode);
    formData.set("commune", commune);
    formData.set("phoneNumber", normalizeAlgerianPhone(String(formData.get("phoneNumber") ?? "")));

    const nextErrors = validate(formData);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      scrollToField(Object.keys(nextErrors)[0]);
      return;
    }

    setErrors({});
    setPending(true);

    try {
      const response = await fetch("/api/provider-signups", {
        method: "POST",
        body: formData,
      });
      const raw = await response.text();
      const data = raw ? (JSON.parse(raw) as SignupSubmissionResult) : null;
      if (data) {
        setResult(data);
      } else {
        setResult({ ok: false, message: copy.submissionError });
      }
    } catch (error) {
      console.error("provider-signup:request_failed", error);
      setResult({ ok: false, message: copy.submissionError });
    } finally {
      setPending(false);
    }
  }

  if (result?.ok) {
    return (
      <div className="surface-card flex flex-col gap-5 rounded-[1.75rem] bg-white p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center self-center rounded-full bg-emerald-100 text-2xl">✅</div>
        <h2 className={`text-2xl font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{labels.successTitle}</h2>
        <p className="text-sm leading-7 text-[var(--muted)]">{labels.successDescription}</p>
        <Link href={result.dashboardUrl ?? `/${locale}/dashboard`} className="button-primary w-full sm:w-fit">
          {locale === "ar" ? "ابدأ باستخدام هَنّيني" : "Commencer sur Hannini"}
        </Link>
      </div>
    );
  }

  return (
    <form ref={formRef} noValidate onSubmit={handleSubmit} className="surface-card flex flex-col gap-5 rounded-[1.75rem] bg-white p-6">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="profileType" value={profileType} />

      <div>
        <h2 className={`text-2xl font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{labels.title}</h2>
        <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{labels.description}</p>
        <div className="mt-4 rounded-[1.25rem] border border-[var(--line)] bg-[var(--soft)] px-4 py-3 text-sm text-[var(--muted)]">
          {copy.pendingHint}
        </div>
      </div>

      <section className="grid gap-4">
        <div className="flex flex-col gap-2">
          <div className="text-sm font-semibold text-[var(--muted)]">{locale === "ar" ? "نوع الملف" : "Type de profil"}</div>
          <div className="grid gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={() => setProfileType("service_provider")}
              aria-pressed={profileType === "service_provider"}
              className={`rounded-[1.25rem] border p-4 text-start transition ${
                profileType === "service_provider" ? "border-terracotta bg-terracotta-pale" : "border-[var(--line)] bg-white"
              }`}
            >
              <div className="text-xs font-semibold text-[var(--muted)]">{locale === "ar" ? "مزود خدمات" : "Prestataire"}</div>
              <div className={`mt-2 text-lg font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>
                {locale === "ar" ? "مزود خدمات منزلية" : "Services à domicile"}
              </div>
            </button>
            <button
              type="button"
              onClick={() => setProfileType("home_business")}
              aria-pressed={profileType === "home_business"}
              className={`rounded-[1.25rem] border p-4 text-start transition ${
                profileType === "home_business" ? "border-terracotta bg-terracotta-pale" : "border-[var(--line)] bg-white"
              }`}
            >
              <div className="text-xs font-semibold text-[var(--muted)]">{locale === "ar" ? "نشاط منزلي" : "Activité à domicile"}</div>
              <div className={`mt-2 text-lg font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>
                {locale === "ar" ? "نشاط منزلي" : "Home business"}
              </div>
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-[0.75rem] border border-[var(--line)] bg-white p-6" data-field="contact">
        <div className="mb-4 border-b border-[var(--line)] pb-3 text-base font-bold text-terracotta">
          {copy.contactTitle}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label data-field="phoneNumber">
            <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">
              {copy.phone} <span className="text-terracotta">• {copy.required}</span>
            </span>
            <input
              name="phoneNumber"
              type="tel"
              className={`input-base ${errors.phoneNumber ? "border-rose-300" : ""}`}
              placeholder="05XXXXXXXX"
              onChange={() => clearFieldError("phoneNumber")}
            />
            {errors.phoneNumber ? <p className="mt-1 text-xs text-rose-600">{errors.phoneNumber}</p> : null}
          </label>
          <label data-field="password">
            <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">
              {copy.password} <span className="text-terracotta">• {copy.required}</span>
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
              {copy.passwordConfirmation} <span className="text-terracotta">• {copy.required}</span>
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
            {errors.passwordConfirmation ? (
              <p className="mt-1 text-xs text-rose-600">{errors.passwordConfirmation}</p>
            ) : null}
          </label>
        </div>
      </section>

      <section className="rounded-[0.75rem] border border-[var(--line)] bg-white p-6" data-field="activity">
        <div className="mb-4 border-b border-[var(--line)] pb-3 text-base font-bold text-terracotta">
          {copy.activityTitle}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label data-field="categorySlug">
            <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">
              {copy.category} <span className="text-terracotta">• {copy.required}</span>
            </span>
            <select
              name="categorySlug"
              className={`input-base ${errors.categorySlug ? "border-rose-300" : ""}`}
              defaultValue={laneCategories[0]?.slug ?? ""}
              onChange={() => clearFieldError("categorySlug")}
            >
              {laneCategories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name[locale]}
                </option>
              ))}
            </select>
            {errors.categorySlug ? <p className="mt-1 text-xs text-rose-600">{errors.categorySlug}</p> : null}
          </label>
          <div data-field="wilayaCode">
            <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">
              {copy.wilaya} <span className="text-terracotta">• {copy.required}</span>
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

      <section className="rounded-[0.75rem] border border-[var(--line)] bg-white p-6" data-field="fullName">
        <div className="mb-4 border-b border-[var(--line)] pb-3 text-base font-bold text-terracotta">
          {copy.identityTitle}
        </div>
        <label>
          <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">
            {copy.fullName} <span className="text-terracotta">• {copy.required}</span>
          </span>
          <input
            name="fullName"
            className={`input-base ${errors.fullName ? "border-rose-300" : ""}`}
            placeholder={locale === "ar" ? "مثال: محمد بن علي" : "Ex: Mohamed Ben Ali"}
            onChange={() => clearFieldError("fullName")}
          />
          {errors.fullName ? <p className="mt-1 text-xs text-rose-600">{errors.fullName}</p> : null}
        </label>
      </section>

      <section className="rounded-[0.75rem] border border-[var(--line)] bg-white p-6">
        <button
          type="button"
          onClick={() => setShowOptional((current) => !current)}
          className="flex w-full items-center justify-between text-base font-bold text-terracotta"
        >
          <span>{copy.optionalToggle}</span>
          <span className={`transition ${showOptional ? "rotate-180" : ""}`}>▾</span>
        </button>
        {showOptional ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{copy.email}</span>
              <input name="email" type="email" className="input-base" placeholder="example@email.com" />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{copy.whatsapp}</span>
              <input name="whatsappNumber" type="tel" className="input-base" placeholder="05XXXXXXXX" />
            </label>
            <label className="sm:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{copy.shortDescription}</span>
              <textarea name="shortDescription" rows={4} className="input-base min-h-28 resize-y" />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{copy.yearsExperience}</span>
              <input name="yearsExperience" type="number" min={0} className="input-base" />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{copy.maps}</span>
              <input name="googleMapsUrl" type="url" className="input-base" placeholder="https://maps.google.com/..." />
            </label>
            <label className="sm:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{copy.workPhotos}</span>
              <input name="workPhotos" type="file" multiple className="input-base py-3" />
            </label>
            <label className="sm:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{copy.verificationDocument}</span>
              <input name="verificationDocument" type="file" className="input-base py-3" />
            </label>
          </div>
        ) : (
          <p className="mt-3 text-sm text-[var(--muted)]">{copy.optionalHint}</p>
        )}
      </section>

      <section className="rounded-[0.75rem] border border-[var(--line)] bg-white p-6" data-field="terms">
        <div className="mb-4 border-b border-[var(--line)] pb-3 text-base font-bold text-terracotta">
          {copy.termsTitle}
        </div>
        <div className="grid gap-3">
          <label className="flex items-start gap-3">
            <input
              name="ageConfirmed"
              type="checkbox"
              className="mt-1 h-4 w-4 accent-terracotta"
              onChange={() => clearFieldError("ageConfirmed")}
            />
            <span className="text-sm text-[var(--muted)]">{copy.termsAge}</span>
          </label>
          {errors.ageConfirmed ? <p className="text-xs text-rose-600">{errors.ageConfirmed}</p> : null}
          <label className="flex items-start gap-3">
            <input
              name="conductAccepted"
              type="checkbox"
              className="mt-1 h-4 w-4 accent-terracotta"
              onChange={() => clearFieldError("conductAccepted")}
            />
            <span className="text-sm text-[var(--muted)]">{copy.termsConduct}</span>
          </label>
          {errors.conductAccepted ? <p className="text-xs text-rose-600">{errors.conductAccepted}</p> : null}
          <label className="flex items-start gap-3">
            <input
              name="policyAccepted"
              type="checkbox"
              className="mt-1 h-4 w-4 accent-terracotta"
              onChange={() => clearFieldError("policyAccepted")}
            />
            <span className="text-sm text-[var(--muted)]">{copy.termsPolicy}</span>
          </label>
          {errors.policyAccepted ? <p className="text-xs text-rose-600">{errors.policyAccepted}</p> : null}
          <p className="text-xs text-[var(--muted)]">{copy.termsHint}</p>
        </div>
      </section>

      {result?.message && !result.ok ? (
        <p role="alert" className="text-sm font-semibold text-rose-700">
          {result.message}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className="button-primary w-full">
        {pending ? (locale === "ar" ? "جارٍ التسجيل..." : "Envoi...") : copy.submit}
      </button>
    </form>
  );
}
