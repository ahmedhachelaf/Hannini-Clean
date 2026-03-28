import Image from "next/image";
import Link from "next/link";
import { formatCurrency, formatNumber, formatResponseTime } from "@/lib/format";
import { getLocalizedValue } from "@/lib/i18n";
import { getCategoryIcon } from "@/lib/icon-map";
import { getGrowthStage, getOpportunityTypes } from "@/lib/provider-growth";
import { IconBadge } from "@/components/ui/icon-badge";
import type { Category, Locale, Provider, Zone } from "@/lib/types";

type ProviderCardProps = {
  locale: Locale;
  provider: Provider;
  category: Category | null;
  zones: Zone[];
  highlighted?: boolean;
  distanceKm?: number | null;
};

// Minimal SVG placeholder for category when no gallery photos exist
function CategoryPlaceholder({ icon, label }: { icon: ReturnType<typeof getCategoryIcon>; label: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-[rgba(20,92,255,0.08)] to-[rgba(13,28,69,0.12)]">
      <IconBadge icon={icon} size={22} className="h-12 w-12" />
      <span className="text-xs font-semibold text-[var(--muted)] opacity-70">{label}</span>
    </div>
  );
}

function formatDistance(distanceKm: number, locale: Locale) {
  if (distanceKm < 1) {
    const meters = Math.max(50, Math.round(distanceKm * 1000));
    return locale === "ar" ? `${meters} م` : `${meters} m`;
  }

  return locale === "ar" ? `${distanceKm.toFixed(1)} كم` : `${distanceKm.toFixed(1)} km`;
}

export function ProviderCard({ locale, provider, category, zones, highlighted = false, distanceKm = null }: ProviderCardProps) {
  const zoneNames = zones.map((zone) => getLocalizedValue(zone.name, locale)).join(" • ");
  const provinceName = zones[0] ? getLocalizedValue(zones[0].provinceName, locale) : locale === "ar" ? "غير محدد" : "Non defini";
  const priceLabel =
    provider.profileType === "home_business"
      ? locale === "ar" ? "السعر الابتدائي" : "Prix de depart"
      : locale === "ar" ? "الساعة" : "Tarif";
  const primaryActionLabel =
    provider.profileType === "home_business"
      ? locale === "ar" ? "اطلب الآن" : "Commander"
      : locale === "ar" ? "احجز الآن" : "Réserver";
  const growthStage = getGrowthStage(provider);
  const opportunities = getOpportunityTypes(provider).slice(0, 3);
  const stageLabels = {
    starting: locale === "ar" ? "بداية المسار" : "Début",
    building: locale === "ar" ? "يبني الثقة" : "En progression",
    trusted: locale === "ar" ? "موثوق" : "Fiable",
    thriving: locale === "ar" ? "مزدهر" : "En plein essor",
  };
  const opportunityLabels = {
    individual_customers: locale === "ar" ? "أفراد" : "Particuliers",
    repeat_clients: locale === "ar" ? "متكرر" : "Récurrent",
    occasion_orders: locale === "ar" ? "مناسبات" : "Occasions",
    business_buyers: locale === "ar" ? "مهني" : "Pro",
    bulk_ready: locale === "ar" ? "جملة" : "Volume",
  };

  // Photo sources: prefer gallery photos, fall back to profile photo
  const coverPhoto = provider.gallery[0] ?? null;
  const thumbPhotos = provider.gallery.slice(1, 4);
  const hasGallery = provider.gallery.length > 0;
  const categoryIcon = getCategoryIcon(category?.slug ?? provider.categorySlug);
  const categoryLabel = category ? getLocalizedValue(category.name, locale) : provider.categorySlug;
  const portfolioLabel = locale === "ar" ? "معرض الأعمال" : "Portfolio";
  const viewPortfolioLabel = locale === "ar" ? "عرض المعرض" : "Voir le portfolio";
  const verificationStatus = provider.verification.status;

  return (
    <article
      className={`surface-card gradient-frame flex h-full flex-col overflow-hidden rounded-[1.75rem] transition-all ${
        highlighted ? "ring-2 ring-[rgba(20,92,255,0.45)] shadow-[0_30px_70px_rgba(12,40,104,0.2)]" : ""
      }`}
    >
      {/* ── Cover photo (200 px tall) ── */}
      <div className="relative h-[200px] w-full overflow-hidden bg-[var(--soft)]">
        {hasGallery && coverPhoto ? (
          <>
            <Image
              src={coverPhoto}
              alt={`${provider.displayName} — ${portfolioLabel}`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-[rgba(13,28,69,0.52)] opacity-0 transition-opacity duration-200 hover:opacity-100">
              <span className="rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-[var(--navy)]">
                {viewPortfolioLabel}
              </span>
            </div>
          </>
        ) : (
          <CategoryPlaceholder icon={categoryIcon} label={categoryLabel} />
        )}

        {/* Verification badge overlay */}
        <div className="absolute bottom-3 start-3 flex flex-wrap gap-1.5">
          {verificationStatus === "verified" ? (
            <span className="rounded-full border border-olive-light bg-olive-pale px-2.5 py-0.5 text-[0.78rem] font-bold text-olive">
              {locale === "ar" ? "✓ موثّق" : "✓ Vérifié"}
            </span>
          ) : (
            <span className="rounded-full border border-gold bg-gold-pale px-2.5 py-0.5 text-[0.78rem] font-bold text-gold">
              {locale === "ar" ? "⏳ قيد التحقق" : "⏳ En vérification"}
            </span>
          )}
          {provider.featured ? (
            <span className="rounded-full border border-white/50 bg-white/80 px-2.5 py-0.5 text-[0.78rem] font-bold text-[var(--ink)] backdrop-blur-sm">
              {locale === "ar" ? "مقترح" : "Recommandé"}
            </span>
          ) : null}
          {provider.womenSafe ? (
            <span className="rounded-full border border-[rgba(20,92,255,0.18)] bg-[rgba(20,92,255,0.12)] px-2.5 py-0.5 text-[0.78rem] font-bold text-[var(--navy)] backdrop-blur-sm">
              {locale === "ar" ? "آمن للنساء" : "Safe pour femmes"}
            </span>
          ) : null}
        </div>
      </div>

      {/* ── Thumbnail strip (up to 3 additional photos) ── */}
      {thumbPhotos.length > 0 ? (
        <div className="flex gap-1 border-b border-[var(--line)] bg-[var(--soft)]">
          {thumbPhotos.map((src, i) => (
            <div key={i} className="relative h-[60px] flex-1 overflow-hidden">
              <Image
                src={src}
                alt={`${provider.displayName} photo ${i + 2}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
          ))}
          {/* Remaining count badge */}
          {provider.gallery.length > 4 ? (
            <div className="flex h-[60px] min-w-[60px] flex-col items-center justify-center bg-[rgba(13,28,69,0.08)] text-xs font-bold text-[var(--muted)]">
              +{provider.gallery.length - 4}
            </div>
          ) : null}
        </div>
      ) : null}

      {/* ── Card body ── */}
      <div className="flex flex-1 flex-col gap-4 p-5">
        {/* Provider identity */}
        <div className="flex items-start gap-3">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-[var(--soft)] ring-1 ring-[rgba(15,95,255,0.1)]">
            <Image
              src={provider.profilePhotoUrl}
              alt={provider.displayName}
              width={112}
              height={112}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className={`text-lg font-extrabold leading-tight tracking-tight ${locale === "ar" ? "arabic-display" : ""}`}>
              {provider.displayName}
            </h3>
            <p className="mt-0.5 flex items-center gap-2 text-sm font-medium text-[var(--muted)]">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[rgba(15,95,255,0.16)] bg-white shadow-[0_8px_18px_rgba(12,40,104,0.12)]">
                {(() => {
                  const Icon = categoryIcon;
                  return <Icon size={14} strokeWidth={2.2} className="text-[var(--navy)]" />;
                })()}
              </span>
              <span>{category ? getLocalizedValue(category.name, locale) : provider.categorySlug}</span>
            </p>
            <p className="mt-1 line-clamp-2 text-[0.875rem] leading-6 text-[var(--muted)]">
              {getLocalizedValue(provider.shortTagline, locale)}
            </p>
          </div>
        </div>

        {/* Stats grid */}
        <dl className="grid grid-cols-2 gap-2 text-[0.875rem]">
          <div className="stat-card rounded-xl p-2.5">
            <dt className="text-[var(--muted)]">{locale === "ar" ? "التقييم" : "Note"}</dt>
            <dd className="mt-0.5 font-bold">{provider.rating.toFixed(1)} / 5</dd>
          </div>
          <div className="stat-card rounded-xl p-2.5">
            <dt className="text-[var(--muted)]">{locale === "ar" ? "الأعمال" : "Missions"}</dt>
            <dd className="mt-0.5 font-bold">{formatNumber(provider.completedJobs, locale)}</dd>
          </div>
          <div className="stat-card rounded-xl p-2.5">
            <dt className="text-[var(--muted)]">{locale === "ar" ? "الرد" : "Réponse"}</dt>
            <dd className="mt-0.5 font-bold">{formatResponseTime(provider.responseTimeMinutes, locale)}</dd>
          </div>
          <div className="stat-card rounded-xl p-2.5">
            <dt className="text-[var(--muted)]">{priceLabel}</dt>
            <dd className="mt-0.5 font-bold">{formatCurrency(provider.hourlyRate, locale)}</dd>
          </div>
        </dl>

        {/* Location row */}
        <div className="rounded-xl border border-[rgba(15,95,255,0.1)] bg-white/70 px-3.5 py-3 text-[0.875rem] leading-6 text-[var(--muted)]">
          <span className="font-semibold text-[var(--ink)]">{provinceName}</span>
          {zoneNames ? <span className="before:mx-1.5 before:content-['•']">{zoneNames}</span> : null}
          {distanceKm !== null ? (
            <span className="before:mx-1.5 before:content-['•']">
              {locale === "ar" ? "يبعد" : "À"} {formatDistance(distanceKm, locale)}
            </span>
          ) : null}
        </div>

        {/* Chips */}
        <div className="flex flex-wrap gap-1.5">
          <span className="chip-button min-h-0 px-2.5 py-1 text-xs">{stageLabels[growthStage]}</span>
          {distanceKm !== null ? (
            <span className="chip-button min-h-0 px-2.5 py-1 text-xs">
              {locale === "ar" ? "قريب منك" : "Proche de vous"}
            </span>
          ) : null}
          {provider.rating >= 4.7 && provider.completedJobs >= 10 ? (
            <span className="chip-button min-h-0 px-2.5 py-1 text-xs">
              {locale === "ar" ? "الأعلى تقييماً" : "Top rated"}
            </span>
          ) : null}
          {provider.womenSafe ? (
            <span className="chip-button min-h-0 px-2.5 py-1 text-xs">
              {locale === "ar" ? "اختيار أكثر أماناً" : "Choix plus sûr"}
            </span>
          ) : null}
          {provider.profileType === "home_business" && provider.bulkOrders?.available ? (
            <span className="chip-button min-h-0 px-2.5 py-1 text-xs">
              {locale === "ar" ? "جاهز لطلبات كبيرة" : "Prêt pour le volume"}
            </span>
          ) : null}
          {opportunities.map((opportunity) => (
            <span key={opportunity} className="chip-button min-h-0 px-2.5 py-1 text-xs">
              {opportunityLabels[opportunity]}
            </span>
          ))}
        </div>

        {/* CTAs */}
        <div className="mt-auto flex flex-col gap-2.5 sm:flex-row">
          <Link href={`/${locale}/providers/${provider.slug}`} className="button-secondary flex-1 text-sm">
            {locale === "ar" ? "عرض الملف" : "Voir le profil"}
          </Link>
          <Link href={`/${locale}/book/${provider.slug}`} className="button-primary flex-1 text-sm">
            {primaryActionLabel}
          </Link>
        </div>
      </div>
    </article>
  );
}
