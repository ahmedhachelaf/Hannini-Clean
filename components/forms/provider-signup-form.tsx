"use client";

import { useMemo, useState } from "react";
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

type FormCopy = {
  required: string;
  essentialsTitle: string;
  essentialsHint: string;
  typeTitle: string;
  serviceTypeTitle: string;
  serviceTypeDescription: string;
  businessTypeTitle: string;
  businessTypeDescription: string;
  fullName: string;
  workshopName: string;
  category: string;
  province: string;
  zone: string;
  phone: string;
  whatsapp: string;
  description: string;
  optionalTitle: string;
  optionalHint: string;
  yearsExperience: string;
  startingPrice: string;
  extraFee: string;
  maps: string;
  socialTitle: string;
  socialHint: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  whatsappBusiness: string;
  website: string;
  buyerAccessTitle: string;
  buyerAccessHint: string;
  bulkAvailable: string;
  minimumOrderQuantity: string;
  productionCapacity: string;
  leadTime: string;
  deliveryArea: string;
  languages: string;
  weekdays: string;
  startTime: string;
  endTime: string;
  uploadsTitle: string;
  profilePhoto: string;
  workPhotos: string;
  verificationDocument: string;
  pendingHint: string;
  submitService: string;
  submitBusiness: string;
  submissionError: string;
  noCategory: string;
  noZone: string;
};

function getCopy(locale: Locale): FormCopy {
  if (locale === "ar") {
    return {
      required: "مطلوب",
      essentialsTitle: "المعلومات الأساسية",
      essentialsHint: "يكفي إدخال الأساسيات للبدء. الباقي اختياري ويمكن استكماله لاحقاً.",
      typeTitle: "نوع الملف",
      serviceTypeTitle: "مزود خدمات منزلية",
      serviceTypeDescription: "سباك، كهربائي، تكييف، طلاء، نجارة وغيرها.",
      businessTypeTitle: "نشاط منزلي",
      businessTypeDescription: "طبخ منزلي، خياطة، حلويات، ومنتجات يدوية محلية.",
      fullName: "الاسم الكامل أو اسم المشروع",
      workshopName: "اسم الورشة أو النشاط (اختياري)",
      category: "الفئة",
      province: "الولاية",
      zone: "المدينة أو المنطقة",
      phone: "رقم الهاتف (اختياري إذا أدخلت واتساب)",
      whatsapp: "رقم واتساب (اختياري إذا أدخلت الهاتف)",
      description: "وصف بسيط عن خدمتك أو نشاطك",
      optionalTitle: "تفاصيل إضافية اختيارية",
      optionalHint: "هذه التفاصيل تساعد على بناء الثقة، لكنها لا تمنع إرسال الطلب.",
      yearsExperience: "سنوات الخبرة",
      startingPrice: "السعر الأساسي أو سعر البداية",
      extraFee: "رسوم التنقل أو التوصيل",
      maps: "رابط Google Maps",
      socialTitle: "الحضور الرقمي والروابط",
      socialHint: "اختياري: يساعد هنيني على إظهار قنواتك الرقمية الموثوقة بجانب ملفك.",
      facebook: "رابط Facebook",
      instagram: "رابط Instagram",
      tiktok: "رابط TikTok",
      whatsappBusiness: "رابط WhatsApp Business",
      website: "الموقع الإلكتروني",
      buyerAccessTitle: "الوصول إلى المشترين وطلبات الجملة",
      buyerAccessHint: "خيار مفيد خصوصاً للطبخ المنزلي، الحلويات، الخياطة، والمنتجات اليدوية أو الإنتاج الصغير.",
      bulkAvailable: "متاح لطلبات الجملة أو المشترين المهنيين",
      minimumOrderQuantity: "الحد الأدنى للطلب",
      productionCapacity: "القدرة الإنتاجية",
      leadTime: "مدة التحضير",
      deliveryArea: "منطقة التوصيل أو التسليم",
      languages: "اللغات",
      weekdays: "أيام التوفر",
      startTime: "بداية التوفر",
      endTime: "نهاية التوفر",
      uploadsTitle: "صور ووثائق اختيارية",
      profilePhoto: "الصورة الشخصية أو الشعار",
      workPhotos: "صور الأعمال",
      verificationDocument: "وثيقة التحقق",
      pendingHint: "بعد الإرسال سيظهر الطلب في لوحة الإدارة بحالة pending للمراجعة اليدوية. لا يوجد بريد إلكتروني تلقائي حالياً.",
      submitService: "إرسال طلب مزود الخدمة",
      submitBusiness: "إرسال طلب النشاط المنزلي",
      submissionError: "تعذر إرسال الطلب حالياً.",
      noCategory: "لا توجد فئات متاحة لهذا المسار حالياً.",
      noZone: "لا توجد مناطق متاحة لهذه الولاية حالياً.",
    };
  }

  return {
    required: "Obligatoire",
    essentialsTitle: "Informations essentielles",
    essentialsHint: "Seules les bases sont nécessaires pour commencer. Le reste peut être ajouté plus tard.",
    typeTitle: "Type de profil",
    serviceTypeTitle: "Prestataire de services à domicile",
    serviceTypeDescription: "Plomberie, électricité, climatisation, peinture, menuiserie et plus.",
    businessTypeTitle: "Activité à domicile",
    businessTypeDescription: "Cuisine maison, couture, pâtisserie et créations locales.",
    fullName: "Nom complet ou nom du projet",
    workshopName: "Nom de l'atelier ou de l'activité (optionnel)",
    category: "Catégorie",
    province: "Wilaya",
    zone: "Ville ou zone",
    phone: "Téléphone (optionnel si WhatsApp est saisi)",
    whatsapp: "WhatsApp (optionnel si téléphone est saisi)",
    description: "Courte description simple de votre activité",
    optionalTitle: "Détails complémentaires optionnels",
    optionalHint: "Ces éléments renforcent la confiance, mais ne bloquent pas l'envoi.",
    yearsExperience: "Années d'expérience",
    startingPrice: "Tarif de base ou prix de départ",
    extraFee: "Frais de déplacement ou livraison",
    maps: "Lien Google Maps",
    socialTitle: "Présence digitale",
    socialHint: "Optionnel : permet d'afficher vos canaux numériques de façon propre sur votre profil Henini.",
    facebook: "Lien Facebook",
    instagram: "Lien Instagram",
    tiktok: "Lien TikTok",
    whatsappBusiness: "Lien WhatsApp Business",
    website: "Site web",
    buyerAccessTitle: "Accès acheteurs et commandes en volume",
    buyerAccessHint: "Utile surtout pour cuisine maison, pâtisseries, couture, créations locales et petites productions.",
    bulkAvailable: "Disponible pour commandes en volume / acheteurs pro",
    minimumOrderQuantity: "Commande minimale",
    productionCapacity: "Capacité de production",
    leadTime: "Délai de préparation",
    deliveryArea: "Zone de livraison ou remise",
    languages: "Langues",
    weekdays: "Jours de disponibilité",
    startTime: "Début",
    endTime: "Fin",
    uploadsTitle: "Photos et documents optionnels",
    profilePhoto: "Photo ou logo",
    workPhotos: "Photos de réalisations",
    verificationDocument: "Document de vérification",
    pendingHint: "Après envoi, la candidature apparaît dans l'admin avec le statut pending pour revue manuelle. Aucun email automatique n'est envoyé pour le moment.",
    submitService: "Envoyer la candidature prestataire",
    submitBusiness: "Envoyer la candidature activité à domicile",
    submissionError: "Impossible d'envoyer la candidature pour le moment.",
    noCategory: "Aucune catégorie disponible pour ce parcours pour le moment.",
    noZone: "Aucune zone disponible pour cette wilaya pour le moment.",
  };
}

export function ProviderSignupForm({ locale, categories, zones, labels }: ProviderSignupFormProps) {
  const copy = getCopy(locale);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<SignupSubmissionResult | null>(null);
  const [profileType, setProfileType] = useState<ProfileType>("service_provider");
  const [provinceSlug, setProvinceSlug] = useState<string>(zones[0]?.provinceSlug ?? "");

  const provinceGroups = useMemo(
    () =>
      Array.from(new Map(zones.map((zone) => [zone.provinceSlug, zone.provinceName])).entries()).map(([slug, name]) => ({
        slug,
        name,
        zones: zones.filter((zone) => zone.provinceSlug === slug),
      })),
    [zones],
  );

  const laneCategories = useMemo(
    () => categories.filter((category) => category.lane === profileType),
    [categories, profileType],
  );
  const provinceZones = provinceGroups.find((group) => group.slug === provinceSlug)?.zones ?? [];
  const primaryCategorySlug = laneCategories[0]?.slug ?? "";
  const primaryZoneSlug = provinceZones[0]?.slug ?? "";

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
    } catch {
      setResult({
        ok: false,
        message: copy.submissionError,
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={handleSubmit} aria-busy={pending} className="surface-card flex flex-col gap-6 rounded-[1.75rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(232,242,255,0.94))] p-6">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="profileType" value={profileType} />

      <div>
        <h2 className={`text-2xl font-extrabold tracking-tight ${locale === "ar" ? "arabic-display" : ""}`}>{labels.title}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">{labels.description}</p>
        <div className="mt-4 rounded-[1.25rem] border border-[rgba(20,92,255,0.14)] bg-[var(--soft)] px-4 py-3 text-sm leading-7 text-[var(--muted)]">
          {copy.pendingHint}
        </div>
      </div>

      <section className="grid gap-4">
        <div className="flex flex-col gap-2">
          <div className="text-sm font-semibold text-[var(--muted)]">{copy.typeTitle}</div>
          <div className="grid gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={() => setProfileType("service_provider")}
              aria-pressed={profileType === "service_provider"}
              className={`rounded-[1.5rem] border p-5 text-start transition ${
                profileType === "service_provider"
                  ? "border-[rgba(20,92,255,0.24)] bg-[var(--accent-soft)] shadow-[0_18px_36px_rgba(20,92,255,0.12)]"
                  : "border-[var(--line)] bg-white"
              }`}
            >
              <div className="text-sm font-semibold text-[var(--muted)]">{locale === "ar" ? "المسار الأول" : "Volet 1"}</div>
              <div className={`mt-2 text-xl font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{copy.serviceTypeTitle}</div>
              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{copy.serviceTypeDescription}</p>
            </button>
            <button
              type="button"
              onClick={() => setProfileType("home_business")}
              aria-pressed={profileType === "home_business"}
              className={`rounded-[1.5rem] border p-5 text-start transition ${
                profileType === "home_business"
                  ? "border-[rgba(20,92,255,0.24)] bg-[var(--accent-soft)] shadow-[0_18px_36px_rgba(20,92,255,0.12)]"
                  : "border-[var(--line)] bg-white"
              }`}
            >
              <div className="text-sm font-semibold text-[var(--muted)]">{locale === "ar" ? "المسار الثاني" : "Volet 2"}</div>
              <div className={`mt-2 text-xl font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{copy.businessTypeTitle}</div>
              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{copy.businessTypeDescription}</p>
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-[rgba(20,92,255,0.12)] bg-white p-5">
        <div className="flex flex-col gap-1">
          <h3 className={`text-lg font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{copy.essentialsTitle}</h3>
          <p className="text-sm leading-7 text-[var(--muted)]">{copy.essentialsHint}</p>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">
              {copy.fullName} <span className="text-[var(--navy)]">• {copy.required}</span>
            </span>
            <input name="fullName" required aria-required="true" className="input-base" />
          </label>

          <label>
            <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{copy.workshopName}</span>
            <input name="workshopName" className="input-base" />
          </label>

          <label>
            <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">
              {copy.category} <span className="text-[var(--navy)]">• {copy.required}</span>
            </span>
            <select key={`category-${profileType}`} name="categorySlug" required aria-required="true" defaultValue={primaryCategorySlug} className="input-base">
              {laneCategories.length === 0 ? <option value="">{copy.noCategory}</option> : null}
              {laneCategories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name[locale]}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">
              {copy.province} <span className="text-[var(--navy)]">• {copy.required}</span>
            </span>
            <select value={provinceSlug} onChange={(event) => setProvinceSlug(event.target.value)} aria-label={copy.province} className="input-base">
              {provinceGroups.map((province) => (
                <option key={province.slug} value={province.slug}>
                  {province.name[locale]}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">
              {copy.zone} <span className="text-[var(--navy)]">• {copy.required}</span>
            </span>
            <select key={`zone-${provinceSlug}`} name="zones" required aria-required="true" defaultValue={primaryZoneSlug} className="input-base">
              {provinceZones.length === 0 ? <option value="">{copy.noZone}</option> : null}
              {provinceZones.map((zone) => (
                <option key={zone.slug} value={zone.slug}>
                  {zone.name[locale]}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{copy.phone}</span>
            <input name="phoneNumber" type="tel" className="input-base" />
          </label>

          <label>
            <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{copy.whatsapp}</span>
            <input name="whatsappNumber" type="tel" className="input-base" />
          </label>
        </div>

        <label className="mt-4 block">
          <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">
            {copy.description} <span className="text-[var(--navy)]">• {copy.required}</span>
          </span>
          <textarea
            name="shortDescription"
            required
            aria-required="true"
            minLength={6}
            rows={4}
            className="input-base min-h-28 resize-y"
            placeholder={
              locale === "ar"
                ? profileType === "home_business"
                  ? "مثال: أطبخ للولائم العائلية وأحضّر حلويات منزلية حسب الطلب."
                  : "مثال: سباك متوفر للتدخلات المنزلية السريعة داخل الولاية."
                : profileType === "home_business"
                  ? "Exemple : cuisine maison pour occasions et commandes de pâtisserie."
                  : "Exemple : plombier disponible pour interventions rapides dans la wilaya."
            }
          />
        </label>
      </section>

      <section className="rounded-[1.5rem] border border-[rgba(20,92,255,0.12)] bg-white p-5">
        <div className="flex flex-col gap-1">
          <h3 className={`text-lg font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{copy.optionalTitle}</h3>
          <p className="text-sm leading-7 text-[var(--muted)]">{copy.optionalHint}</p>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label>
            <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{copy.yearsExperience}</span>
            <input name="yearsExperience" type="number" min={0} className="input-base" />
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{copy.startingPrice}</span>
            <input name="hourlyRate" type="number" min={0} className="input-base" />
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{copy.extraFee}</span>
            <input name="travelFee" type="number" min={0} className="input-base" />
          </label>
          <label className="sm:col-span-2 lg:col-span-3">
            <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{copy.maps}</span>
            <input name="googleMapsUrl" type="url" className="input-base" placeholder="https://maps.google.com/..." />
          </label>
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-[rgba(20,92,255,0.12)] bg-[var(--soft)] p-4">
          <div className="flex flex-col gap-1">
            <h4 className="text-sm font-extrabold text-[var(--ink)]">{copy.socialTitle}</h4>
            <p className="text-sm leading-7 text-[var(--muted)]">{copy.socialHint}</p>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{copy.facebook}</span>
              <input name="facebookUrl" type="url" className="input-base" placeholder="https://facebook.com/..." />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{copy.instagram}</span>
              <input name="instagramUrl" type="url" className="input-base" placeholder="https://instagram.com/..." />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{copy.tiktok}</span>
              <input name="tiktokUrl" type="url" className="input-base" placeholder="https://tiktok.com/..." />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{copy.whatsappBusiness}</span>
              <input name="whatsappBusinessUrl" type="url" className="input-base" placeholder="https://wa.me/..." />
            </label>
            <label className="sm:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{copy.website}</span>
              <input name="websiteUrl" type="url" className="input-base" placeholder="https://example.com" />
            </label>
          </div>
        </div>

        {profileType === "home_business" ? (
          <div className="mt-6 rounded-[1.5rem] border border-[rgba(20,92,255,0.12)] bg-[linear-gradient(180deg,rgba(214,230,255,0.72),rgba(255,255,255,0.95))] p-4">
            <div className="flex flex-col gap-1">
              <h4 className="text-sm font-extrabold text-[var(--ink)]">{copy.buyerAccessTitle}</h4>
              <p className="text-sm leading-7 text-[var(--muted)]">{copy.buyerAccessHint}</p>
            </div>
            <label className="mt-4 flex items-start gap-3 rounded-[1.25rem] border border-[rgba(15,95,255,0.12)] bg-white px-4 py-4">
              <input name="availableForBulkOrders" type="checkbox" className="mt-1 h-4 w-4 accent-[var(--accent)]" />
              <span className="text-sm font-semibold text-[var(--ink)]">{copy.bulkAvailable}</span>
            </label>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label>
                <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{copy.minimumOrderQuantity}</span>
                <input name="minimumOrderQuantity" className="input-base" />
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{copy.productionCapacity}</span>
                <input name="productionCapacity" className="input-base" />
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{copy.leadTime}</span>
                <input name="leadTime" className="input-base" />
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{copy.deliveryArea}</span>
                <input name="deliveryArea" className="input-base" />
              </label>
            </div>
          </div>
        ) : null}

        <fieldset className="mt-5 space-y-3">
          <legend className="text-sm font-semibold text-[var(--muted)]">{copy.languages}</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {languageChoices.map((language) => (
              <label key={language.value} className="flex min-h-12 items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--soft)] px-4 py-3">
                <input type="checkbox" name="languages" value={language.value} defaultChecked={language.value === "العربية"} className="h-4 w-4 accent-[var(--accent)]" />
                <span>{locale === "ar" ? language.ar : language.fr}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-5 space-y-3">
          <legend className="text-sm font-semibold text-[var(--muted)]">{copy.weekdays}</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            {weekdays.map((day) => (
              <label key={day.value} className="flex min-h-12 items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--soft)] px-4 py-3">
                <input type="checkbox" name="weekdays" value={day.value} className="h-4 w-4 accent-[var(--accent)]" />
                <span>{locale === "ar" ? day.ar : day.fr}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{copy.startTime}</span>
            <input name="startTime" type="time" className="input-base" defaultValue="08:00" />
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{copy.endTime}</span>
            <input name="endTime" type="time" className="input-base" defaultValue="18:00" />
          </label>
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-[rgba(20,92,255,0.12)] bg-white p-5">
        <div className="flex flex-col gap-1">
          <h3 className={`text-lg font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{copy.uploadsTitle}</h3>
          <p className="text-sm leading-7 text-[var(--muted)]">
            {locale === "ar"
              ? "يمكنك إرفاق صور أو وثيقة إثبات الآن، لكن عدم رفعها لا يمنع إرسال الطلب."
              : "Vous pouvez joindre des photos ou un justificatif maintenant, sans que cela bloque l'envoi."}
          </p>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <label>
            <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{copy.profilePhoto}</span>
            <input name="profilePhoto" type="file" accept="image/*" className="input-base py-3" />
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{copy.workPhotos}</span>
            <input name="workPhotos" type="file" accept="image/*" multiple className="input-base py-3" />
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{copy.verificationDocument}</span>
            <input name="verificationDocument" type="file" className="input-base py-3" />
          </label>
        </div>
      </section>

      {result ? (
        <div aria-live="polite" className={`rounded-2xl border px-4 py-3 text-sm ${result.ok ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
          <div className="font-semibold">{result.ok ? labels.successTitle : locale === "ar" ? "تعذر الإرسال" : "Envoi impossible"}</div>
          <div className="mt-1">{result.message}</div>
        </div>
      ) : null}

      <button type="submit" disabled={pending} className="button-primary w-full sm:w-fit">
        {pending ? (locale === "ar" ? "جارٍ الإرسال..." : "Envoi...") : profileType === "home_business" ? copy.submitBusiness : copy.submitService}
      </button>
    </form>
  );
}
