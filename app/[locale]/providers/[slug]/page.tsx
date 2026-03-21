import Image from "next/image";
import Link from "next/link";
import { formatCurrency, formatDate, formatNumber, formatResponseTime } from "@/lib/format";
import { getDictionary, getLocalizedValue, isLocale } from "@/lib/i18n";
import { getCategories, getProviderBySlug, getReviews, getZones } from "@/lib/repository";
import { notFound } from "next/navigation";

type ProviderProfilePageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

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
  const providerZones = provider.zones
    .map((zoneSlug) => zones.find((zone) => zone.slug === zoneSlug))
    .filter((zone): zone is NonNullable<typeof zone> => Boolean(zone));
  const primaryZone = providerZones[0] ?? null;
  const whatsappMessage = encodeURIComponent(
    locale === "ar"
      ? `السلام عليكم، أريد تأكيد حجز مع ${provider.displayName} عبر هنيني.`
      : `Bonjour, je souhaite confirmer une réservation avec ${provider.displayName} via Henini.`,
  );
  const priceLabel = provider.profileType === "home_business" ? dictionary.common.startingPrice : dictionary.common.hourlyRate;
  const secondaryFeeLabel = provider.profileType === "home_business" ? dictionary.common.deliveryFee : dictionary.common.travelFee;
  const primaryActionLabel = provider.profileType === "home_business" ? dictionary.common.requestNow : dictionary.common.bookNow;
  const bookingHint = provider.profileType === "home_business" ? dictionary.provider.businessHint : dictionary.provider.bookingHint;
  const locationHint = provider.profileType === "home_business" ? dictionary.provider.privacyLocationHint : dictionary.provider.serviceLocationHint;
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
              {provider.isVerified ? <span className="status-pill status-pill--verified">{dictionary.common.verified}</span> : null}
            </div>
            <div>
              <h1 className={`text-4xl font-extrabold tracking-[-0.05em] ${locale === "ar" ? "arabic-display" : ""}`}>{provider.displayName}</h1>
              <p className="mt-2 text-sm font-medium text-[var(--muted)]">
                {category ? `${category.icon} ${getLocalizedValue(category.name, locale)}` : provider.categorySlug}
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
            <h2 className={`text-2xl font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{dictionary.provider.galleryTitle}</h2>
            {galleryImages.length > 0 ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {galleryImages.map((imageUrl, index) => (
                  <div key={`${imageUrl}-${index}`} className="overflow-hidden rounded-[1.5rem] border border-[var(--line)] bg-white">
                    <Image
                      src={imageUrl}
                      alt={provider.galleryCaptions?.[index] ?? provider.displayName}
                      width={640}
                      height={480}
                      className="h-48 w-full object-cover"
                    />
                    {provider.galleryCaptions?.[index] ? (
                      <div className="border-t border-[var(--line)] px-4 py-3 text-xs leading-6 text-[var(--muted)]">
                        {provider.galleryCaptions[index]}
                      </div>
                    ) : null}
                  </div>
                ))}
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
            <p>
              <span className="font-semibold text-[var(--ink)]">{locale === "ar" ? "واتساب:" : "WhatsApp :"}</span>{" "}
              {provider.whatsappNumber}
            </p>
            <p>
              <span className="font-semibold text-[var(--ink)]">{locale === "ar" ? "الهاتف:" : "Téléphone :"}</span>{" "}
              {provider.phoneNumber}
            </p>
            <p>
              <span className="font-semibold text-[var(--ink)]">{locale === "ar" ? "عدد التقييمات:" : "Nombre d'avis :"}</span>{" "}
              {provider.reviewCount}
            </p>
          </div>
          {socialLinks.length > 0 ? (
            <div className="mt-6 border-t border-[var(--line)] pt-5">
              <h3 className="text-base font-bold text-[var(--ink)]">{dictionary.provider.digitalPresenceTitle}</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {socialLinks.map((link) => (
                  <a
                    key={link.key}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="chip-button min-h-0 border-[rgba(15,95,255,0.14)] bg-[var(--soft)] px-3 py-2 text-xs font-semibold text-[var(--brand)]"
                  >
                    {link.label}
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
