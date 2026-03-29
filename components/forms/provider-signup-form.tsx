"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { OTPInput } from "@/components/OTPInput";
import { WilayaSelect } from "@/components/WilayaSelect";
import { isValidAlgerianPhone, normalizeAlgerianPhone } from "@/lib/phone";
import type { Category, Locale, ProfileType, SignupSubmissionResult, Zone } from "@/lib/types";

type ProviderSignupFormProps = {
  locale: Locale;
  categories: Category[];
  zones: Zone[];
  callbackState?: {
    verification?: string;
    verifiedMethod?: string;
    verifiedTarget?: string;
  };
  labels: {
    title: string;
    description: string;
    successTitle: string;
    successDescription: string;
  };
};

type FormErrors = Partial<Record<string, string>>;

type VerificationMethod = "phone" | "email";
type PhoneVerificationChannel = "sms" | "whatsapp";
type EmailVerificationMode = "otp";

type VerificationCookieState = {
  method: VerificationMethod;
  target: string;
  channel?: PhoneVerificationChannel;
  expiresAt: string;
  resendAvailableAt?: string;
  verifiedAt?: string;
};

type FormCopy = {
  required: string;
  contactTitle: string;
  verificationTitle: string;
  verificationDescription: string;
  verificationPhoneOption: string;
  verificationSmsOption: string;
  verificationWhatsappOption: string;
  verificationEmailOption: string;
  verificationEmailLabel: string;
  verificationStart: string;
  verificationResend: string;
  verificationStartLink: string;
  verificationResendLink: string;
  verificationWaiting: string;
  verificationVerified: string;
  verificationUsePhone: string;
  verificationUseEmailOtp: string;
  verificationUseEmailLink: string;
  verificationEmailSuccess: string;
  verificationEmailError: string;
  verificationEmailLinkSent: string;
  verificationEmailCheckInbox: string;
  verificationLinkWaiting: string;
  verificationPhoneUnavailable: string;
  verificationEmailOnlyMode: string;
  verificationWhatsappUnavailable: string;
  verificationCodePrompt: string;
  verificationTimeout: string;
  verificationAttempts: string;
  verificationRequired: string;
  verificationSendFailed: string;
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
  workshopName: string;
  email: string;
  whatsapp: string;
  shortDescription: string;
  yearsExperience: string;
  maps: string;
  profilePhoto: string;
  workPhotos: string;
  certificateFiles: string;
  qualificationNotes: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  website: string;
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
      verificationTitle: "خطوة التحقق قبل الإرسال",
      verificationDescription: "أكمل التحقق من الهاتف أو البريد الإلكتروني أولاً قبل إرسال الطلب.",
      verificationPhoneOption: "تحقق عبر الهاتف",
      verificationSmsOption: "رسالة نصية",
      verificationWhatsappOption: "واتساب",
      verificationEmailOption: "تحقق عبر البريد الإلكتروني",
      verificationEmailLabel: "البريد الإلكتروني للتحقق",
      verificationStart: "إرسال رمز التحقق",
      verificationResend: "إعادة إرسال الرمز",
      verificationStartLink: "إرسال رمز التحقق",
      verificationResendLink: "إعادة إرسال الرمز",
      verificationWaiting: "تم إرسال الرمز. أدخله هنا لإكمال التحقق.",
      verificationVerified: "تم التحقق بنجاح. يمكنك الآن إرسال الطلب.",
      verificationUsePhone: "سنرسل رمز تحقق من 6 أرقام إلى رقم الهاتف الذي أدخلته.",
      verificationUseEmailOtp: "سنرسل رمز تحقق من 6 أرقام إلى بريدك الإلكتروني.",
      verificationUseEmailLink: "سنرسل رمز تحقق من 6 أرقام إلى بريدك الإلكتروني.",
      verificationEmailSuccess: "تم تأكيد بريدك الإلكتروني بنجاح. يمكنك الآن إرسال الطلب.",
      verificationEmailError: "تعذر التحقق من الرمز الإلكتروني. اطلب رمزاً جديداً ثم حاول مرة أخرى.",
      verificationEmailLinkSent: "تم إرسال رمز التحقق إلى بريدك الإلكتروني.",
      verificationEmailCheckInbox: "إذا لم تجد الرسالة، افحص البريد غير المرغوب فيه ثم أعد الإرسال بعد انتهاء المهلة.",
      verificationLinkWaiting: "افتح بريدك الإلكتروني، انسخ الرمز المكوّن من 6 أرقام، ثم أدخله هنا.",
      verificationPhoneUnavailable: "التحقق عبر الهاتف غير مفعّل حالياً لأن مزود الرسائل غير مضبوط بعد.",
      verificationEmailOnlyMode: "التحقق المتاح حالياً يتم عبر البريد الإلكتروني فقط. سنُظهر التحقق عبر الهاتف هنا عندما يصبح مفعلًا فعلاً.",
      verificationWhatsappUnavailable: "واتساب غير متاح حالياً لأن قناة واتساب لم تُضبط بعد لدى مزود الرسائل.",
      verificationCodePrompt: "أدخل الرمز المكوّن من 6 أرقام",
      verificationTimeout: "تنتهي صلاحية الرمز بعد",
      verificationAttempts: "عدد المحاولات المتبقية",
      verificationRequired: "يجب إكمال خطوة التحقق قبل إرسال الطلب.",
      verificationSendFailed: "تعذر بدء خطوة التحقق حالياً.",
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
      workshopName: "اسم النشاط أو الورشة (اختياري)",
      email: "البريد الإلكتروني (اختياري)",
      whatsapp: "رقم واتساب",
      shortDescription: "نبذة مختصرة (اختياري)",
      yearsExperience: "سنوات الخبرة (اختياري)",
      maps: "رابط خرائط غوغل (اختياري)",
      profilePhoto: "صورة الملف أو الشعار (اختياري)",
      workPhotos: "صور الأعمال (اختياري)",
      certificateFiles: "شهادات أو إثباتات مهنية (اختياري)",
      qualificationNotes: "تفاصيل إضافية عن الخبرة أو المؤهلات (اختياري)",
      facebook: "رابط أو حساب Facebook (اختياري)",
      instagram: "رابط أو حساب Instagram (اختياري)",
      tiktok: "رابط أو حساب TikTok (اختياري)",
      website: "الموقع الإلكتروني (اختياري)",
      verificationDocument: "وثيقة التحقق (اختياري)",
      submit: "إرسال طلب الانضمام",
      pendingHint: "بعد الإرسال سيظهر الطلب في لوحة الإدارة بحالة قيد المراجعة.",
      submissionError: "تعذر إرسال الطلب حالياً.",
    };
  }

  return {
    required: "Obligatoire",
    contactTitle: "Coordonnées",
    verificationTitle: "Étape de vérification avant l'envoi",
    verificationDescription: "Vérifiez d'abord votre téléphone ou votre e-mail avant d'envoyer la candidature.",
    verificationPhoneOption: "Vérifier par téléphone",
    verificationSmsOption: "SMS",
    verificationWhatsappOption: "WhatsApp",
    verificationEmailOption: "Vérifier par e-mail",
    verificationEmailLabel: "E-mail de vérification",
    verificationStart: "Envoyer le code",
    verificationResend: "Renvoyer le code",
    verificationStartLink: "Envoyer le code",
    verificationResendLink: "Renvoyer le code",
    verificationWaiting: "Le code a été envoyé. Saisissez-le ici pour terminer la vérification.",
    verificationVerified: "Vérification réussie. Vous pouvez maintenant envoyer votre demande.",
    verificationUsePhone: "Nous enverrons un code à 6 chiffres au numéro saisi.",
    verificationUseEmailOtp: "Nous enverrons un code à 6 chiffres à votre e-mail.",
    verificationUseEmailLink: "Nous enverrons un code à 6 chiffres à votre e-mail.",
    verificationEmailSuccess: "Votre e-mail a bien été confirmé. Vous pouvez maintenant envoyer la demande.",
    verificationEmailError: "La vérification du code e-mail a échoué. Demandez un nouveau code puis réessayez.",
    verificationEmailLinkSent: "Le code de vérification a été envoyé à votre e-mail.",
    verificationEmailCheckInbox: "Si vous ne voyez pas le message, vérifiez les spams puis renvoyez-le après le délai.",
    verificationLinkWaiting: "Ouvrez l'e-mail, copiez le code à 6 chiffres puis saisissez-le ici.",
      verificationPhoneUnavailable: "La vérification par téléphone n'est pas activée car le fournisseur SMS n'est pas encore configuré.",
      verificationEmailOnlyMode: "La vérification disponible pour le moment passe uniquement par e-mail. La vérification par téléphone n'apparaîtra ici que lorsqu'elle sera réellement active.",
      verificationWhatsappUnavailable: "WhatsApp n'est pas disponible car le canal WhatsApp n'est pas encore configuré chez le fournisseur de messages.",
    verificationCodePrompt: "Entrez le code à 6 chiffres",
    verificationTimeout: "Le code expire dans",
    verificationAttempts: "Essais restants",
    verificationRequired: "La vérification doit être terminée avant l'envoi.",
    verificationSendFailed: "Impossible de démarrer la vérification pour le moment.",
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
    workshopName: "Nom d’activité ou atelier (optionnel)",
    email: "E-mail (optionnel)",
    whatsapp: "WhatsApp",
    shortDescription: "Courte description (optionnel)",
    yearsExperience: "Années d’expérience (optionnel)",
    maps: "Lien Google Maps (optionnel)",
    profilePhoto: "Photo de profil ou logo (optionnel)",
    workPhotos: "Photos de réalisations (optionnel)",
    certificateFiles: "Certificats ou preuves de qualification (optionnel)",
    qualificationNotes: "Détails supplémentaires sur l’expérience ou les qualifications (optionnel)",
    facebook: "Lien ou compte Facebook (optionnel)",
    instagram: "Lien ou compte Instagram (optionnel)",
    tiktok: "Lien ou compte TikTok (optionnel)",
    website: "Site web (optionnel)",
    verificationDocument: "Document de vérification (optionnel)",
    submit: "Envoyer la candidature",
    pendingHint: "Après envoi, votre dossier passe en revue manuelle.",
    submissionError: "Impossible d'envoyer la candidature pour le moment.",
  };
}

export function ProviderSignupForm({ locale, categories, labels, callbackState }: ProviderSignupFormProps) {
  const copy = getCopy(locale);
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<SignupSubmissionResult | null>(null);
  const [profileType, setProfileType] = useState<ProfileType>("service_provider");
  const [wilayaCode, setWilayaCode] = useState("");
  const [commune, setCommune] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [showOptional, setShowOptional] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [verificationMethod, setVerificationMethod] = useState<VerificationMethod>("email");
  const [emailVerificationMode, setEmailVerificationMode] = useState<EmailVerificationMode>("otp");
  const [phoneOtpEnabled, setPhoneOtpEnabled] = useState(false);
  const [enabledPhoneChannels, setEnabledPhoneChannels] = useState<PhoneVerificationChannel[]>([]);
  const [phoneVerificationChannel, setPhoneVerificationChannel] = useState<PhoneVerificationChannel>("sms");
  const [verificationPending, setVerificationPending] = useState(false);
  const [verificationChecking, setVerificationChecking] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState<{ type: "error" | "success" | "info"; message: string } | null>(null);
  const [verificationState, setVerificationState] = useState<{
    pending: VerificationCookieState | null;
    verified: VerificationCookieState | null;
    attemptsRemaining: number | null;
  }>({
    pending: null,
    verified: null,
    attemptsRemaining: null,
  });
  const [otpResetKey, setOtpResetKey] = useState(0);
  const [clock, setClock] = useState(Date.now());
  const callbackVerificationState = callbackState?.verification;
  const callbackVerifiedMethod = callbackState?.verifiedMethod;
  const callbackVerifiedTarget = callbackState?.verifiedTarget;

  const laneCategories = useMemo(
    () => categories.filter((category) => category.lane === profileType),
    [categories, profileType],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadVerificationStatus() {
      try {
        const response = await fetch("/api/provider-verification/status", { cache: "no-store" });
        const data = (await response.json().catch(() => null)) as
          | {
              ok?: boolean;
              phoneOtpEnabled?: boolean;
              enabledPhoneChannels?: PhoneVerificationChannel[];
              emailVerificationMode?: EmailVerificationMode;
              pending?: VerificationCookieState | null;
              verified?: VerificationCookieState | null;
            }
          | null;

        if (!cancelled && data?.ok) {
          setPhoneOtpEnabled(Boolean(data.phoneOtpEnabled));
          setEmailVerificationMode("otp");
          const nextChannels = data.enabledPhoneChannels?.length ? data.enabledPhoneChannels : [];
          setEnabledPhoneChannels(nextChannels);
          setPhoneVerificationChannel(nextChannels.includes("sms") ? "sms" : (nextChannels[0] ?? "sms"));
          setVerificationState((current) => ({
            ...current,
            pending: data.pending ?? null,
            verified: data.verified ?? null,
          }));
          if (!data.phoneOtpEnabled) {
            setVerificationMethod("email");
          }
        }
      } catch (error) {
        console.error("provider-signup:verification_status_failed", error);
      }
    }

    void loadVerificationStatus();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    clearFieldError("verification");
    setResult(null);
  }, [phoneNumber, email, verificationMethod]);

  useEffect(() => {
    if (!phoneOtpEnabled && verificationMethod === "phone") {
      setVerificationMethod("email");
      setVerificationFeedback(null);
    }
  }, [phoneOtpEnabled, verificationMethod]);

  useEffect(() => {
    if (callbackVerifiedMethod === "email" && callbackVerifiedTarget && !email) {
      setEmail(callbackVerifiedTarget);
      setVerificationMethod("email");
    }

    if (callbackVerificationState === "email-success") {
      setVerificationFeedback({ type: "success", message: copy.verificationEmailSuccess });
    } else if (callbackVerificationState === "email-error") {
      setVerificationFeedback({ type: "error", message: copy.verificationEmailError });
    }
  }, [callbackVerificationState, callbackVerifiedMethod, callbackVerifiedTarget, copy.verificationEmailError, copy.verificationEmailSuccess, email]);

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

  function getVerificationTarget(method: VerificationMethod) {
    return method === "phone" ? normalizeAlgerianPhone(phoneNumber) : email.trim().toLowerCase();
  }

  function isEmailCandidateValid(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim().toLowerCase());
  }

  const activeVerificationTarget = getVerificationTarget(verificationMethod);
  const pendingForCurrentTarget =
    verificationState.pending &&
    verificationState.pending.method === verificationMethod &&
    verificationState.pending.target === activeVerificationTarget &&
    (verificationMethod !== "phone" || !verificationState.pending.channel || verificationState.pending.channel === phoneVerificationChannel) &&
    Date.parse(verificationState.pending.expiresAt) > clock
      ? verificationState.pending
      : null;
  const verifiedForCurrentTarget =
    verificationState.verified &&
    verificationState.verified.method === verificationMethod &&
    verificationState.verified.target === activeVerificationTarget &&
    (verificationMethod !== "phone" || !verificationState.verified.channel || verificationState.verified.channel === phoneVerificationChannel) &&
    Date.parse(verificationState.verified.expiresAt) > clock
      ? verificationState.verified
      : null;
  const resendSecondsRemaining = pendingForCurrentTarget?.resendAvailableAt
    ? Math.max(0, Math.ceil((Date.parse(pendingForCurrentTarget.resendAvailableAt) - clock) / 1000))
    : 0;
  const verificationSecondsRemaining = pendingForCurrentTarget
    ? Math.max(0, Math.ceil((Date.parse(pendingForCurrentTarget.expiresAt) - clock) / 1000))
    : 0;

  async function startVerification(resend = false) {
    const target = getVerificationTarget(verificationMethod);

    if (verificationMethod === "phone" && !isValidAlgerianPhone(target)) {
      setFieldError("phoneNumber", locale === "ar" ? "أدخل رقم هاتف جزائري صالحاً قبل التحقق." : "Saisissez un numéro algérien valide avant la vérification.");
      scrollToField("phoneNumber");
      return;
    }

    if (verificationMethod === "email" && !isEmailCandidateValid(target)) {
      setFieldError(
        "email",
        locale === "ar"
          ? "أدخل بريداً إلكترونياً صالحاً لإرسال الرمز."
          : "Saisissez un e-mail valide pour recevoir le code.",
      );
      scrollToField("verification");
      return;
    }

    setVerificationPending(true);
    setVerificationFeedback(null);

    try {
      const response = await fetch("/api/provider-verification/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          method: verificationMethod,
          channel: verificationMethod === "phone" ? phoneVerificationChannel : undefined,
          target,
          resend,
        }),
      });

      const data = (await response.json().catch(() => null)) as
          | {
            ok?: boolean;
            message?: string;
            retryAfterSeconds?: number;
            enabledPhoneChannels?: PhoneVerificationChannel[];
            emailVerificationMode?: EmailVerificationMode;
            pending?: VerificationCookieState | null;
          }
        | null;

      if (!response.ok || !data?.ok) {
        setVerificationFeedback({
          type: "error",
          message: data?.message ?? copy.verificationSendFailed,
        });
        return;
      }

      setVerificationState((current) => ({
        ...current,
        pending: data.pending ?? null,
        verified: null,
        attemptsRemaining: 5,
      }));
          if (data?.enabledPhoneChannels?.length) {
            setEnabledPhoneChannels(data.enabledPhoneChannels);
          }
          if (data?.emailVerificationMode) {
            setEmailVerificationMode("otp");
          }
      clearFieldError("verification");
      clearFieldError("email");
      setOtpResetKey((value) => value + 1);
      setVerificationFeedback(null);
    } catch (error) {
      console.error("provider-signup:verification_start_failed", error);
      setVerificationFeedback({ type: "error", message: copy.verificationSendFailed });
    } finally {
      setVerificationPending(false);
    }
  }

  async function handleOtpComplete(code: string) {
    if (verificationChecking) return;

    setVerificationChecking(true);
    setVerificationFeedback(null);

    try {
      const response = await fetch("/api/provider-verification/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          method: verificationMethod,
          target: getVerificationTarget(verificationMethod),
          code,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | {
            ok?: boolean;
            message?: string;
            verified?: VerificationCookieState | null;
            attemptsRemaining?: number;
          }
        | null;

      if (!response.ok || !data?.ok) {
        setVerificationState((current) => ({
          ...current,
          pending: data?.attemptsRemaining === 0 || response.status === 429 ? null : current.pending,
          attemptsRemaining: data?.attemptsRemaining ?? current.attemptsRemaining,
        }));
        setVerificationFeedback({
          type: "error",
          message: data?.message ?? (locale === "ar" ? "الرمز غير صحيح." : "Code incorrect."),
        });
        setOtpResetKey((value) => value + 1);
        return;
      }

      setVerificationState({
        pending: null,
        verified: data.verified ?? null,
        attemptsRemaining: null,
      });
      clearFieldError("verification");
      setVerificationFeedback({
        type: "success",
        message: data.message ?? copy.verificationVerified,
      });
    } catch (error) {
      console.error("provider-signup:verification_verify_failed", error);
      setVerificationFeedback({
        type: "error",
        message: locale === "ar" ? "تعذر التحقق من الرمز حالياً." : "Impossible de vérifier le code pour le moment.",
      });
      setOtpResetKey((value) => value + 1);
    } finally {
      setVerificationChecking(false);
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

    if (verificationMethod === "email" && !isEmailCandidateValid(email)) {
      nextErrors.email =
        locale === "ar" ? "يرجى إدخال بريد إلكتروني صالح لإتمام التحقق." : "Merci de saisir un e-mail valide pour la vérification.";
    }

    if (!whatsappNumber || !isValidAlgerianPhone(whatsappNumber)) {
      nextErrors.whatsappNumber =
        locale === "ar" ? "يرجى إدخال رقم واتساب جزائري صالح." : "Veuillez saisir un numéro WhatsApp algérien valide.";
    }

    if (!verifiedForCurrentTarget) {
      nextErrors.verification = copy.verificationRequired;
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
    formData.set("phoneNumber", normalizeAlgerianPhone(phoneNumber));
    formData.set("whatsappNumber", normalizeAlgerianPhone(whatsappNumber));
    formData.set("email", email.trim().toLowerCase());

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
              value={phoneNumber}
              className={`input-base ${errors.phoneNumber ? "border-rose-300" : ""}`}
              placeholder="05XXXXXXXX"
              onChange={(event) => {
                setPhoneNumber(event.target.value);
                clearFieldError("phoneNumber");
              }}
            />
            {errors.phoneNumber ? <p className="mt-1 text-xs text-rose-600">{errors.phoneNumber}</p> : null}
          </label>
          <label data-field="whatsappNumber">
            <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">
              {copy.whatsapp} <span className="text-terracotta">• {copy.required}</span>
            </span>
            <input
              name="whatsappNumber"
              type="tel"
              value={whatsappNumber}
              className={`input-base ${errors.whatsappNumber ? "border-rose-300" : ""}`}
              placeholder="05XXXXXXXX"
              onChange={(event) => {
                setWhatsappNumber(event.target.value);
                clearFieldError("whatsappNumber");
              }}
            />
            {errors.whatsappNumber ? <p className="mt-1 text-xs text-rose-600">{errors.whatsappNumber}</p> : null}
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

      <section className="rounded-[0.75rem] border border-[var(--line)] bg-white p-6" data-field="verification">
        <div className="mb-4 border-b border-[var(--line)] pb-3 text-base font-bold text-terracotta">
          {copy.verificationTitle}
        </div>
        <p className="text-sm leading-7 text-[var(--muted)]">{copy.verificationDescription}</p>
        {phoneOtpEnabled ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                setVerificationMethod("phone");
                setVerificationFeedback(null);
              }}
              className={`rounded-[1rem] border px-4 py-3 text-sm font-semibold transition ${
                verificationMethod === "phone"
                  ? "border-terracotta bg-terracotta-pale text-terracotta"
                  : "border-[var(--line)] bg-white text-[var(--muted)]"
              }`}
            >
              {copy.verificationPhoneOption}
            </button>
            <button
              type="button"
              onClick={() => {
                setVerificationMethod("email");
                setVerificationFeedback(null);
              }}
              className={`rounded-[1rem] border px-4 py-3 text-sm font-semibold transition ${
                verificationMethod === "email"
                  ? "border-terracotta bg-terracotta-pale text-terracotta"
                  : "border-[var(--line)] bg-white text-[var(--muted)]"
              }`}
            >
              {copy.verificationEmailOption}
            </button>
          </div>
        ) : (
          <div className="mt-3 rounded-[1rem] border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            {copy.verificationEmailOnlyMode}
          </div>
        )}

        <div className="mt-4 space-y-4">
          {verificationMethod === "email" ? (
            <label>
              <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">
                {copy.verificationEmailLabel} <span className="text-terracotta">• {copy.required}</span>
              </span>
              <input
                name="email"
                type="email"
                value={email}
                className={`input-base ${errors.email ? "border-rose-300" : ""}`}
                placeholder="example@email.com"
                onChange={(event) => {
                  setEmail(event.target.value);
                  clearFieldError("email");
                }}
              />
              {errors.email ? <p className="mt-1 text-xs text-rose-600">{errors.email}</p> : null}
            </label>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-[var(--muted)]">{copy.verificationUsePhone}</p>
              <div className={`grid gap-3 ${enabledPhoneChannels.length > 1 ? "sm:grid-cols-2" : ""}`}>
                {enabledPhoneChannels.includes("sms") ? (
                  <button
                    type="button"
                    onClick={() => setPhoneVerificationChannel("sms")}
                    className={`rounded-[1rem] border px-4 py-3 text-sm font-semibold transition ${
                      phoneVerificationChannel === "sms"
                        ? "border-terracotta bg-terracotta-pale text-terracotta"
                        : "border-[var(--line)] bg-white text-[var(--muted)]"
                    }`}
                  >
                    {copy.verificationSmsOption}
                  </button>
                ) : null}
                {enabledPhoneChannels.includes("whatsapp") ? (
                  <button
                    type="button"
                    onClick={() => setPhoneVerificationChannel("whatsapp")}
                    className={`rounded-[1rem] border px-4 py-3 text-sm font-semibold transition ${
                      phoneVerificationChannel === "whatsapp"
                        ? "border-terracotta bg-terracotta-pale text-terracotta"
                        : "border-[var(--line)] bg-white text-[var(--muted)]"
                    }`}
                  >
                    {copy.verificationWhatsappOption}
                  </button>
                ) : null}
              </div>
              {!enabledPhoneChannels.includes("whatsapp") ? (
                <p className="text-xs text-[var(--muted)]">{copy.verificationWhatsappUnavailable}</p>
              ) : null}
            </div>
          )}

          {verificationMethod === "email" ? (
            <p className="text-sm text-[var(--muted)]">
              {copy.verificationUseEmailOtp}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={verificationPending || verificationChecking || Boolean(verifiedForCurrentTarget)}
              onClick={() => void startVerification(false)}
              className="button-primary w-full sm:w-auto disabled:opacity-60"
            >
              {verificationPending ? "..." : copy.verificationStart}
            </button>
            {pendingForCurrentTarget ? (
              <button
                type="button"
                disabled={verificationPending || verificationChecking || resendSecondsRemaining > 0}
                onClick={() => void startVerification(true)}
                className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] disabled:opacity-50"
              >
                {copy.verificationResend}
                {resendSecondsRemaining > 0 ? ` (${resendSecondsRemaining}s)` : ""}
              </button>
            ) : null}
          </div>

          {pendingForCurrentTarget ? (
            <div className="rounded-[1rem] border border-[var(--line)] bg-[var(--soft)] p-4">
              <p className="text-sm font-semibold text-[var(--ink)]">{copy.verificationWaiting}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {copy.verificationTimeout} {verificationSecondsRemaining}s
              </p>
              {verificationState.attemptsRemaining !== null ? (
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {copy.verificationAttempts}: {verificationState.attemptsRemaining}
                </p>
              ) : null}
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">{copy.verificationCodePrompt}</p>
              <div className="mt-3">
                <OTPInput key={otpResetKey} onComplete={(code) => void handleOtpComplete(code)} />
              </div>
            </div>
          ) : null}

          {verifiedForCurrentTarget ? (
            <div className="rounded-[1rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
              {copy.verificationVerified}
            </div>
          ) : null}

          {verificationFeedback ? (
            <p
              className={`text-sm font-medium ${
                verificationFeedback.type === "error"
                  ? "text-rose-700"
                  : verificationFeedback.type === "success"
                    ? "text-emerald-700"
                    : "text-[var(--muted)]"
              }`}
            >
              {verificationFeedback.message}
            </p>
          ) : null}

          {errors.verification ? <p className="text-xs text-rose-600">{errors.verification}</p> : null}
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
              <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{copy.workshopName}</span>
              <input name="workshopName" className="input-base" placeholder={locale === "ar" ? "مثال: ورشة بن علي" : "Ex: Atelier Ben Ali"} />
            </label>
            {verificationMethod !== "email" ? (
              <label>
                <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{copy.email}</span>
                <input
                  name="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="input-base"
                  placeholder="example@email.com"
                />
              </label>
            ) : (
              <div className="rounded-[1rem] border border-[var(--line)] bg-[var(--soft)] px-4 py-3 text-sm text-[var(--muted)]">
                {locale === "ar"
                  ? "سيتم حفظ بريد التحقق نفسه داخل ملفك ويمكن استخدامه لإشعارات المتابعة."
                  : "L’e-mail utilisé pour la vérification sera aussi conservé dans votre profil pour les notifications."}
              </div>
            )}
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
            <label>
              <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{copy.website}</span>
              <input name="websiteUrl" type="text" className="input-base" placeholder="https://..." />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{copy.facebook}</span>
              <input name="facebookUrl" type="text" className="input-base" placeholder="@page or https://facebook.com/..." />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{copy.instagram}</span>
              <input name="instagramUrl" type="text" className="input-base" placeholder="@username or https://instagram.com/..." />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{copy.tiktok}</span>
              <input name="tiktokUrl" type="text" className="input-base" placeholder="@username or https://tiktok.com/@..." />
            </label>
            <label className="sm:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{copy.profilePhoto}</span>
              <input name="profilePhoto" type="file" accept="image/*" className="input-base py-3" />
            </label>
            <label className="sm:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{copy.workPhotos}</span>
              <input name="workPhotos" type="file" multiple accept="image/*" className="input-base py-3" />
            </label>
            <label className="sm:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{copy.certificateFiles}</span>
              <input name="certificateFiles" type="file" multiple className="input-base py-3" />
            </label>
            <label className="sm:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{copy.qualificationNotes}</span>
              <textarea name="qualificationNotes" rows={3} className="input-base min-h-24 resize-y" />
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
