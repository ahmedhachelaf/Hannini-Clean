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
  const whatsappMessage = encodeURIComponent(
    locale === "ar"
      ? `السلام عليكم، أريد تأكيد حجز مع ${provider.displayName} عبر هنيني.`
      : `Bonjour, je souhaite confirmer une réservation avec ${provider.displayName} via Henini.`,
  );

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
                    <span className="font-semibold text-[var(--ink)]">{dictionary.common.hourlyRate}:</span> {formatCurrency(provider.hourlyRate, locale)}
                  </div>
                  <div>
                    <span className="font-semibold text-[var(--ink)]">{dictionary.common.travelFee}:</span> {formatCurrency(provider.travelFee, locale)}
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

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href={`/${locale}/book/${provider.slug}`} className="button-primary">
                {dictionary.common.bookNow}
              </Link>
              <a
                href={`https://wa.me/${provider.whatsappNumber}?text=${whatsappMessage}`}
                target="_blank"
                rel="noreferrer"
                className="button-secondary"
              >
                {dictionary.common.whatsapp}
              </a>
              <a href={provider.googleMapsUrl} target="_blank" rel="noreferrer" className="button-secondary">
                {dictionary.common.googleMaps}
              </a>
            </div>
            <p className="text-sm text-[var(--muted)]">{dictionary.provider.bookingHint}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-8">
          <div className="surface-card rounded-[1.75rem] p-6">
            <h2 className={`text-2xl font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{dictionary.provider.galleryTitle}</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {(provider.gallery.length > 0 ? provider.gallery : ["/gallery/work-1.svg", "/gallery/work-2.svg", "/gallery/work-3.svg"]).map((imageUrl) => (
                <div key={imageUrl} className="overflow-hidden rounded-[1.5rem] border border-[var(--line)] bg-white">
                  <Image src={imageUrl} alt={provider.displayName} width={640} height={480} className="h-48 w-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          <div className="surface-card rounded-[1.75rem] p-6">
            <h2 className={`text-2xl font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>
              {locale === "ar" ? "الموقع والمناطق المغطاة" : "Localisation et zones couvertes"}
            </h2>
            <div className="map-panel mt-5">
              <iframe
                title={locale === "ar" ? "موقع مزود الخدمة" : "Carte du prestataire"}
                src={`https://www.google.com/maps?q=${encodeURIComponent(`${provider.displayName} ${providerZones.map((zone) => getLocalizedValue(zone.name, locale)).join(" ")} Algeria`)}&z=11&output=embed`}
                className="h-72 w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="border-t border-[rgba(15,95,255,0.12)] bg-white/88 p-5">
                <div className="flex flex-wrap gap-2">
                  {providerZones.map((zone) => (
                    <span key={zone.slug} className="chip-button min-h-0 px-3 py-2 text-xs">
                      {getLocalizedValue(zone.name, locale)}
                    </span>
                  ))}
                </div>
                <a href={provider.googleMapsUrl} target="_blank" rel="noreferrer" className="button-secondary mt-4">
                  {dictionary.common.googleMaps}
                </a>
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
        </aside>
      </section>
    </div>
  );
}
