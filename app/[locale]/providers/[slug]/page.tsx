import Image from "next/image";
import Link from "next/link";
import { PhotoGallery } from "@/components/providers/photo-gallery";
import { formatCurrency, formatDate, formatNumber, formatResponseTime } from "@/lib/format";
import { getDictionary, getLocalizedValue, isLocale } from "@/lib/i18n";
import { getCategoryIcon } from "@/lib/icon-map";
import { getGrowthStage, getOpportunityTypes, getProviderJourney, getProviderReadiness, isMentorReady } from "@/lib/provider-growth";
import { getCategories, getProviderBySlug, getReviews, getZones } from "@/lib/repository";
import { notFound } from "next/navigation";

type ProviderProfilePageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

function getSocialBadge(key: string) {
  switch (key) {
    case "facebook":
      return "f";
    case "instagram":
      return "ig";
    case "tiktok":
      return "tt";
    case "whatsapp-business":
      return "wa";
    case "website":
      return "www";
    default:
      return "•";
  }
}

function getGalleryThemes(captions: string[], profileType: "service_provider" | "home_business", locale: "ar" | "fr") {
  const text = captions.join(" ").toLowerCase();
  const tags: string[] = [];

  if (profileType === "service_provider") {
    if (text.includes("before") || text.includes("after") || text.includes("قبل") || text.includes("بعد")) {
      tags.push(locale === "ar" ? "قبل / بعد" : "Avant / après");
    }
    tags.push(locale === "ar" ? "أعمال ميدانية" : "Interventions terrain");
  } else {
    if (text.includes("cake") || text.includes("tray") || text.includes("حلويات") || text.includes("صينية")) {
      tags.push(locale === "ar" ? "طلبات مناسبات" : "Commandes d'occasion");
    }
    tags.push(locale === "ar" ? "إنتاج منزلي" : "Production maison");
  }

  return Array.from(new Set(tags)).slice(0, 3);
}

export default async function ProviderProfilePage({ params }: ProviderProfilePageProps) {
  const { locale, slug } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const provider = await getProviderBySlug(slug);

  if (!provider) {
    notFound();
  }

  const [categories, zones, reviews] = await Promise.all([
    getCategories(),
    getZones(),
    getReviews(provider.id),
  ]);

  const category = categories.find((item) => item.slug === provider.categorySlug) ?? null;
  const CategoryIcon = getCategoryIcon(category?.slug ?? provider.categorySlug);
  const providerZones = provider.zones
    .map((zoneSlug) => zones.find((zone) => zone.slug === zoneSlug))
    .filter((zone): zone is NonNullable<typeof zone> => Boolean(zone));
  const primaryZone = providerZones[0] ?? null;
  const whatsappMessage = encodeURIComponent(
    locale === "ar"
      ? `السلام عليكم، أريد تأكيد حجز مع ${provider.displayName} عبر هَنّيني.`
      : `Bonjour, je souhaite confirmer une réservation avec ${provider.displayName} via Hannini.`,
  );
  const priceLabel = provider.profileType === "home_business" ? dictionary.common.startingPrice : dictionary.common.hourlyRate;
  const secondaryFeeLabel = provider.profileType === "home_business" ? dictionary.common.deliveryFee : dictionary.common.travelFee;
  const primaryActionLabel = provider.profileType === "home_business" ? dictionary.common.requestNow : dictionary.common.bookNow;
  const bookingHint = provider.profileType === "home_business" ? dictionary.provider.businessHint : dictionary.provider.bookingHint;
  const locationHint = provider.profileType === "home_business" ? dictionary.provider.privacyLocationHint : dictionary.provider.serviceLocationHint;
  const readiness = getProviderReadiness(provider);
  const journey = getProviderJourney(provider);
  const opportunities = getOpportunityTypes(provider);
  const growthStage = getGrowthStage(provider);
  const opportunityLabels = {
    individual_customers: locale === "ar" ? "زبائن أفراد" : "Clients particuliers",
    repeat_clients: locale === "ar" ? "جاهز للزبائن المتكررين" : "Prêt pour des clients récurrents",
    occasion_orders: locale === "ar" ? "طلبات مناسبات" : "Commandes d'occasion",
    business_buyers: locale === "ar" ? "مشترون مهنيون" : "Acheteurs professionnels",
    bulk_ready: locale === "ar" ? "جاهز للجملة" : "Prêt au volume",
  };
  const readinessLabels = {
    category: locale === "ar" ? "الفئة محددة" : "Catégorie définie",
    location: locale === "ar" ? "الموقع مكتمل" : "Zone renseignée",
    contact: locale === "ar" ? "التواصل واضح" : "Contact disponible",
    description: locale === "ar" ? "الوصف واضح" : "Description claire",
    pricing: locale === "ar" ? "السعر ظاهر" : "Tarification visible",
    portfolio: locale === "ar" ? "معرض أعمال مرفوع" : "Portfolio publié",
    availability: locale === "ar" ? "أوقات العمل مضافة" : "Disponibilités ajoutées",
    moderation: locale === "ar" ? "تمت المراجعة" : "Revu par l'équipe",
    trust: locale === "ar" ? "ثقة وتقييمات" : "Confiance et avis",
    digital: locale === "ar" ? "حضور رقمي" : "Présence digitale",
    bulk: locale === "ar" ? "جاهزية للجملة" : "Préparation volume",
  };
  const journeyLabels = {
    joined: locale === "ar" ? "انضم" : "Rejoint",
    profile_completed: locale === "ar" ? "أكمل الملف" : "Profil complété",
    portfolio_added: locale === "ar" ? "أضاف أعماله" : "Portfolio ajouté",
    reviewed: locale === "ar" ? "تمت المراجعة" : "Dossier revu",
    approved: locale === "ar" ? "تم القبول" : "Approuvé",
    first_client: locale === "ar" ? "أول زبون" : "Premier client",
    first_5_jobs: locale === "ar" ? "أول 5 أعمال" : "5 premières missions",
    highly_rated: locale === "ar" ? "تقييم قوي" : "Très bien noté",
    bulk_order_ready: locale === "ar" ? "جاهز للجملة" : "Prêt au volume",
    mentor_ready: locale === "ar" ? "جاهز للإلهام" : "Mentor-ready",
  };
  const stageLabels = {
    starting: locale === "ar" ? "في بداية المسار" : "Début de parcours",
    building: locale === "ar" ? "يبني حضوره" : "Profil en construction",
    trusted: locale === "ar" ? "موثوق ويتقدم" : "Fiable et en progression",
    thriving: locale === "ar" ? "موثوق ويزدهر" : "Trusted and thriving",
  };
  const socialLinks = [
    { key: "facebook", label: "Facebook", url: provider.socialLinks?.facebook },
    { key: "instagram", label: "Instagram", url: provider.socialLinks?.instagram },
    { key: "tiktok", label: "TikTok", url: provider.socialLinks?.tiktok },
    { key: "whatsapp-business", label: "WhatsApp Business", url: provider.socialLinks?.whatsappBusiness },
    { key: "website", label: locale === "ar" ? "الموقع الإلكتروني" : "Site web", url: provider.socialLinks?.website },
  ].filter((item): item is { key: string; label: string; url: string } => Boolean(item.url));
  const galleryImages =
    provider.gallery.length > 0
      ? provider.gallery
      : provider.galleryCaptions && provider.galleryCaptions.length > 0
        ? provider.galleryCaptions.map((_, index) => `/gallery/work-${(index % 3) + 1}.svg`)
        : [];
  const galleryThemes = getGalleryThemes(provider.galleryCaptions ?? [], provider.profileType, locale);
  const readinessTierLabels = {
    starter: locale === "ar" ? "بداية واعدة" : "Bon départ",
    building: locale === "ar" ? "يتحسن بسرعة" : "En progression",
    good: locale === "ar" ? "جاهز بشكل جيد" : "Bien préparé",
    strong: locale === "ar" ? "جاهز بقوة للفرص" : "Très prêt pour les opportunités",
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <section className="surface-card gradient-frame rounded-[2rem] p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className="overflow-hidden rounded-[1.75rem] border border-[var(--line)] bg-white">
            <Image src={provider.profilePhotoUrl} alt={provider.displayName} width={640} height={480} className="h-full w-full object-cover" />
          </div>

          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="status-pill border border-[var(--line)] bg-white text-[var(--ink)]">{dictionary.provider.heroLabel}</span>
              {provider.verification.status === "verified" ? (
                <span className="rounded-full border border-olive-light bg-olive-pale px-2.5 py-0.5 text-xs font-bold text-olive">
                  {locale === "ar" ? "✓ موثّق" : "✓ Vérifié"}
                </span>
              ) : (
                <span className="rounded-full border border-gold bg-gold-pale px-2.5 py-0.5 text-xs font-bold text-gold">
                  {locale === "ar" ? "⏳ قيد التحقق" : "⏳ En vérification"}
                </span>
              )}
            </div>
            <div>
              <h1 className={`text-4xl font-extrabold tracking-[-0.05em] ${locale === "ar" ? "arabic-display" : ""}`}>{provider.displayName}</h1>
              <p className="mt-2 flex items-center gap-2 text-sm font-medium text-[var(--muted)]">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[rgba(15,95,255,0.16)] bg-white shadow-[0_8px_18px_rgba(12,40,104,0.12)]">
                  <CategoryIcon size={14} strokeWidth={2.2} className="text-[var(--navy)]" />
                </span>
                <span>{category ? getLocalizedValue(category.name, locale) : provider.categorySlug}</span>
              </p>
            </div>
            <p className="max-w-3xl text-sm leading-8 text-[var(--muted)]">{getLocalizedValue(provider.bio, locale)}</p>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[1.25rem] border border-[var(--line)] bg-white p-4">
                <div className="text-sm text-[var(--muted)]">{locale === "ar" ? "التقييم" : "Note"}</div>
                <div className="mt-2 text-2xl font-extrabold">{provider.rating.toFixed(1)}</div>
              </div>
              <div className="rounded-[1.25rem] border border-[var(--line)] bg-white p-4">
                <div className="text-sm text-[var(--muted)]">{dictionary.common.completedJobs}</div>
                <div className="mt-2 text-2xl font-extrabold">{formatNumber(provider.completedJobs, locale)}</div>
              </div>
              <div className="rounded-[1.25rem] border border-[var(--line)] bg-white p-4">
                <div className="text-sm text-[var(--muted)]">{dictionary.common.responseSpeed}</div>
                <div className="mt-2 text-2xl font-extrabold">{formatResponseTime(provider.responseTimeMinutes, locale)}</div>
              </div>
              <div className="rounded-[1.25rem] border border-[var(--line)] bg-white p-4">
                <div className="text-sm text-[var(--muted)]">{locale === "ar" ? "الخبرة" : "Expérience"}</div>
                <div className="mt-2 text-2xl font-extrabold">{provider.yearsExperience}</div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-[1.5rem] border border-[var(--line)] bg-white p-5">
                <h2 className="text-base font-bold">{dictionary.common.serviceZones}</h2>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                  {providerZones.map((zone) => getLocalizedValue(zone.name, locale)).join(locale === "ar" ? " • " : " • ")}
                </p>
                <div className="mt-4 space-y-2 text-sm text-[var(--muted)]">
                  <div>
                    <span className="font-semibold text-[var(--ink)]">{dictionary.common.languages}:</span> {provider.languages.join(" • ")}
                  </div>
                  <div>
                    <span className="font-semibold text-[var(--ink)]">{priceLabel}:</span> {formatCurrency(provider.hourlyRate, locale)}
                  </div>
                  <div>
                    <span className="font-semibold text-[var(--ink)]">{secondaryFeeLabel}:</span> {formatCurrency(provider.travelFee, locale)}
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-[var(--line)] bg-white p-5">
                <h2 className="text-base font-bold">{dictionary.common.availability}</h2>
                <div className="mt-4 grid gap-3">
                  {provider.availability.map((slot) => (
                    <div key={`${slot.dayKey}-${slot.startTime}`} className="flex items-center justify-between rounded-2xl bg-[var(--soft)] px-4 py-3 text-sm">
                      <span>{slot.label[locale]}</span>
                      <span className="font-semibold">
                        {slot.startTime} - {slot.endTime}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="rounded-[1.5rem] border border-[rgba(15,95,255,0.14)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(232,242,255,0.92))] p-5 shadow-[0_18px_40px_rgba(15,95,255,0.08)]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-base font-bold text-[var(--ink)]">{locale === "ar" ? "جاهزية الملف" : "Niveau de préparation"}</h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="status-pill border border-[var(--line)] bg-white text-[var(--ink)]">{readiness.score}%</span>
                    <span className="chip-button min-h-0 px-3 py-2 text-xs">{readinessTierLabels[readiness.scoreTier]}</span>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                  {locale === "ar"
                    ? `أكمل هذا الملف ${readiness.completed} من ${readiness.total} عناصر تساعده على بناء الثقة والظهور لفرص أفضل.`
                    : `Ce profil a complété ${readiness.completed} éléments sur ${readiness.total} pour inspirer confiance et accéder à de meilleures opportunités.`}
                </p>
                <div className="mt-4 overflow-hidden rounded-full bg-[rgba(15,95,255,0.08)]">
                  <div
                    className="h-2 rounded-full bg-[linear-gradient(90deg,#0f5fff,#4f8dff)]"
                    style={{ width: `${Math.max(readiness.score, 8)}%` }}
                    aria-hidden="true"
                  />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {readiness.checks.map((check) => (
                    <span
                      key={check.key}
                      className={`status-pill ${
                        check.complete ? "status-pill--verified" : "border border-[var(--line)] bg-[var(--soft)] text-[var(--ink)]"
                      }`}
                    >
                      {readinessLabels[check.key]}
                    </span>
                  ))}
                </div>
                {readiness.nextSteps.length > 0 ? (
                  <div className="mt-4 rounded-[1.25rem] border border-[var(--line)] bg-white px-4 py-4 text-sm leading-7 text-[var(--muted)]">
                    <span className="font-semibold text-[var(--ink)]">{locale === "ar" ? "الخطوة التالية" : "Étape suivante"}:</span>{" "}
                    {readiness.nextSteps.map((step) => readinessLabels[step.key]).join(locale === "ar" ? " • " : " • ")}
                  </div>
                ) : null}
                {readiness.strengthSignals.length > 0 ? (
                  <div className="mt-4 rounded-[1.25rem] border border-[rgba(15,95,255,0.12)] bg-[var(--soft)] px-4 py-4 text-sm leading-7 text-[var(--muted)]">
                    <span className="font-semibold text-[var(--ink)]">{locale === "ar" ? "ما يقوّي هذا الملف الآن:" : "Ce qui renforce déjà ce profil :"}</span>{" "}
                    {readiness.strengthSignals.map((signal) => readinessLabels[signal.key]).join(locale === "ar" ? " • " : " • ")}
                  </div>
                ) : null}
              </div>

              <div className="rounded-[1.5rem] border border-[rgba(15,95,255,0.14)] bg-white p-5 shadow-[0_18px_40px_rgba(15,95,255,0.08)]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-base font-bold text-[var(--ink)]">{locale === "ar" ? "رحلة النمو" : "Parcours de progression"}</h2>
                  <span className="chip-button min-h-0 px-3 py-2 text-xs">{stageLabels[growthStage]}</span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {journey.steps.map((step) => (
                    <div
                      key={step.key}
                      className={`rounded-[1rem] border px-4 py-3 text-sm ${
                        step.complete
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-[var(--line)] bg-[var(--soft)] text-[var(--muted)]"
                      }`}
                    >
                      {journeyLabels[step.key]}
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {opportunities.map((key) => (
                    <span key={key} className="chip-button min-h-0 px-3 py-2 text-xs">
                      {opportunityLabels[key]}
                    </span>
                  ))}
                  {isMentorReady(provider) ? (
                    <span className="chip-button min-h-0 px-3 py-2 text-xs">
                      {locale === "ar" ? "ملهم لغيره" : "Inspirant pour d'autres"}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            {provider.profileType === "home_business" && provider.bulkOrders?.available ? (
              <div className="rounded-[1.5rem] border border-[rgba(15,95,255,0.14)] bg-[linear-gradient(180deg,rgba(243,248,255,0.96),rgba(255,255,255,0.98))] p-5 shadow-[0_18px_50px_rgba(15,95,255,0.12)]">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="status-pill border border-[rgba(15,95,255,0.14)] bg-white text-[var(--brand)]">
                    {dictionary.provider.businessBuyerBadge}
                  </span>
                  <h2 className="text-base font-bold text-[var(--ink)]">{dictionary.provider.bulkOrdersTitle}</h2>
                </div>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{dictionary.provider.bulkOrdersHint}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {provider.bulkOrders.minimumOrderQuantity ? (
                    <div className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm">
                      <div className="text-[var(--muted)]">{dictionary.provider.minimumOrderQuantity}</div>
                      <div className="mt-1 font-semibold text-[var(--ink)]">{provider.bulkOrders.minimumOrderQuantity}</div>
                    </div>
                  ) : null}
                  {provider.bulkOrders.productionCapacity ? (
                    <div className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm">
                      <div className="text-[var(--muted)]">{dictionary.provider.productionCapacity}</div>
                      <div className="mt-1 font-semibold text-[var(--ink)]">{provider.bulkOrders.productionCapacity}</div>
                    </div>
                  ) : null}
                  {provider.bulkOrders.leadTime ? (
                    <div className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm">
                      <div className="text-[var(--muted)]">{dictionary.provider.leadTime}</div>
                      <div className="mt-1 font-semibold text-[var(--ink)]">{provider.bulkOrders.leadTime}</div>
                    </div>
                  ) : null}
                  {provider.bulkOrders.deliveryArea ? (
                    <div className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm">
                      <div className="text-[var(--muted)]">{dictionary.provider.deliveryArea}</div>
                      <div className="mt-1 font-semibold text-[var(--ink)]">{provider.bulkOrders.deliveryArea}</div>
                    </div>
                  ) : null}
                </div>
                <div className="mt-4">
                  <Link href={`/${locale}/book/${provider.slug}`} className="button-primary">
                    {dictionary.provider.businessInquiryCta}
                  </Link>
                </div>
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href={`/${locale}/book/${provider.slug}`} className="button-primary">
                {primaryActionLabel}
              </Link>
              <a
                href={`https://wa.me/${provider.whatsappNumber}?text=${whatsappMessage}`}
                target="_blank"
                rel="noreferrer"
                className="button-secondary"
              >
                {dictionary.common.whatsapp}
              </a>
              {provider.profileType === "service_provider" ? (
                <a href={provider.googleMapsUrl} target="_blank" rel="noreferrer" className="button-secondary">
                  {dictionary.common.googleMaps}
                </a>
              ) : null}
              <Link href={`/${locale}/support?actor=customer&category=provider_report&providerSlug=${provider.slug}&providerId=${provider.id}`} className="button-secondary">
                {dictionary.provider.reportIssue}
              </Link>
            </div>
            <p className="text-sm text-[var(--muted)]">{bookingHint}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-8">
          <div className="surface-card rounded-[1.75rem] p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className={`text-2xl font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{dictionary.provider.galleryTitle}</h2>
              {galleryImages.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {galleryThemes.map((theme) => (
                    <span key={theme} className="chip-button min-h-0 px-3 py-2 text-xs">{theme}</span>
                  ))}
                  <span className="chip-button min-h-0 px-3 py-2 text-xs">
                    {locale === "ar" ? `${galleryImages.length} عيّنة` : `${galleryImages.length} photos`}
                  </span>
                </div>
              ) : null}
            </div>
            {galleryImages.length > 0 ? (
              <div className="mt-5">
                <PhotoGallery
                  images={galleryImages}
                  captions={provider.galleryCaptions}
                  providerName={provider.displayName}
                  locale={locale}
                />
              </div>
            ) : (
              <div className="mt-5 rounded-[1.5rem] border border-[var(--line)] bg-[var(--soft)] px-5 py-6 text-sm leading-7 text-[var(--muted)]">
                {locale === "ar"
                  ? "لم تتم إضافة صور أعمال بعد. يمكن للمزوّد إرفاق عينات العمل أثناء التسجيل أو عند تحديث الملف لاحقاً."
                  : "Aucun échantillon de travail n'a encore été ajouté. Le prestataire pourra joindre des exemples pendant l'inscription ou plus tard."}
              </div>
            )}
          </div>

          <div className="surface-card rounded-[1.75rem] p-6">
            <h2 className={`text-2xl font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>
              {locale === "ar" ? "الموقع والمناطق المغطاة" : "Localisation et zones couvertes"}
            </h2>
            <div className="map-panel mt-5">
              <iframe
                title={locale === "ar" ? "موقع مزود الخدمة" : "Carte du prestataire"}
                src={
                  primaryZone
                    ? `https://www.openstreetmap.org/export/embed.html?bbox=${primaryZone.coordinates.longitude - 0.12}%2C${primaryZone.coordinates.latitude - 0.08}%2C${primaryZone.coordinates.longitude + 0.12}%2C${primaryZone.coordinates.latitude + 0.08}&layer=mapnik&marker=${primaryZone.coordinates.latitude}%2C${primaryZone.coordinates.longitude}`
                    : "https://www.openstreetmap.org/export/embed.html?bbox=-0.8%2C35.6%2C3.5%2C36.6&layer=mapnik"
                }
                className="h-72 w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="border-t border-[rgba(15,95,255,0.12)] bg-white/88 p-5">
                <p className="mb-3 text-sm leading-7 text-[var(--muted)]">{locationHint}</p>
                <div className="flex flex-wrap gap-2">
                  {providerZones.map((zone) => (
                    <span key={zone.slug} className="chip-button min-h-0 px-3 py-2 text-xs">
                      {getLocalizedValue(zone.name, locale)}
                    </span>
                  ))}
                </div>
                {provider.profileType === "service_provider" ? (
                  <a href={provider.googleMapsUrl} target="_blank" rel="noreferrer" className="button-secondary mt-4">
                    {dictionary.common.googleMaps}
                  </a>
                ) : null}
              </div>
            </div>
          </div>

          <div className="surface-card rounded-[1.75rem] p-6">
            <h2 className={`text-2xl font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{dictionary.provider.reviewTitle}</h2>
            <div className="mt-5 space-y-4">
              {reviews.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">{locale === "ar" ? "لا توجد مراجعات بعد." : "Pas encore d'avis."}</p>
              ) : (
                reviews.map((review) => (
                  <article key={review.id} className="rounded-[1.5rem] border border-[var(--line)] bg-white p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="font-bold">{review.customerName}</div>
                      <div className="text-sm text-[var(--muted)]">
                        {review.rating}/5 • {formatDate(review.createdAt, locale)}
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{review.comment}</p>
                  </article>
                ))
              )}
            </div>
          </div>
        </div>

        <aside className="surface-card rounded-[1.75rem] p-6">
          <h2 className="text-xl font-extrabold">{dictionary.provider.aboutTitle}</h2>
          <div className="mt-4 space-y-4 text-sm leading-7 text-[var(--muted)]">
            <p>{getLocalizedValue(provider.bio, locale)}</p>
            {provider.profileType === "home_business" ? (
              <div className="rounded-[1.25rem] border border-[rgba(15,95,255,0.14)] bg-[var(--soft)] px-4 py-4">
                <div className="font-semibold text-[var(--ink)]">
                  {locale === "ar" ? "تواصل يحافظ على الخصوصية" : "Contact avec plus de confidentialité"}
                </div>
                <p className="mt-2">
                  {locale === "ar"
                    ? "تفاصيل التواصل المباشر الكاملة لا تظهر هنا افتراضياً للنشاطات المنزلية. استخدم زر الطلب أو واتساب لبدء تواصل منظم، ثم تتم مشاركة التفاصيل المناسبة بعد التأكيد."
                    : "Les coordonnées directes complètes ne sont pas affichées ici par défaut pour les activités à domicile. Utilisez le bouton de demande ou WhatsApp pour démarrer un échange encadré, puis les détails utiles sont partagés après confirmation."}
                </p>
              </div>
            ) : (
              <>
                <p>
                  <span className="font-semibold text-[var(--ink)]">{locale === "ar" ? "واتساب:" : "WhatsApp :"}</span>{" "}
                  {provider.whatsappNumber}
                </p>
                <p>
                  <span className="font-semibold text-[var(--ink)]">{locale === "ar" ? "الهاتف:" : "Téléphone :"}</span>{" "}
                  {provider.phoneNumber}
                </p>
              </>
            )}
            <p>
              <span className="font-semibold text-[var(--ink)]">{locale === "ar" ? "عدد التقييمات:" : "Nombre d'avis :"}</span>{" "}
              {provider.reviewCount}
            </p>
            {providerZones.length > 0 ? (
              <p>
                <span className="font-semibold text-[var(--ink)]">{locale === "ar" ? "الولاية والمنطقة:" : "Wilaya et zone :"}</span>{" "}
                {primaryZone ? `${getLocalizedValue(primaryZone.provinceName, locale)} • ${getLocalizedValue(primaryZone.name, locale)}` : providerZones.map((zone) => getLocalizedValue(zone.name, locale)).join(" • ")}
              </p>
            ) : null}
          </div>
          {socialLinks.length > 0 ? (
            <div className="mt-6 border-t border-[var(--line)] pt-5">
              <h3 className="text-base font-bold text-[var(--ink)]">{dictionary.provider.digitalPresenceTitle}</h3>
              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                {locale === "ar"
                  ? "روابط رقمية اختيارية تساعد على استكشاف أمثلة إضافية من الأعمال أو متابعة النشاط عبر القنوات المعروفة."
                  : "Des liens numériques optionnels pour découvrir d'autres exemples ou suivre l'activité sur des canaux déjà connus."}
              </p>
              <div className="mt-3 grid gap-3">
                {socialLinks.map((link) => (
                  <a
                    key={link.key}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 rounded-[1.25rem] border border-[rgba(15,95,255,0.14)] bg-[var(--soft)] px-4 py-3 text-sm font-semibold text-[var(--brand)] transition hover:border-[rgba(15,95,255,0.28)] hover:bg-white"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[11px] font-extrabold uppercase text-[var(--brand)] shadow-[0_10px_20px_rgba(15,95,255,0.12)]">
                      {getSocialBadge(link.key)}
                    </span>
                    <span className="flex-1">{link.label}</span>
                    <span className="text-xs text-[var(--muted)]">{locale === "ar" ? "افتح الرابط" : "Ouvrir"}</span>
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </aside>
      </section>
    </div>
  );
}
