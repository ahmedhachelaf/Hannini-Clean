import Image from "next/image";
import Link from "next/link";
import { formatCurrency, formatNumber, formatResponseTime } from "@/lib/format";
import { getLocalizedValue } from "@/lib/i18n";
import type { Category, Locale, Provider, Zone } from "@/lib/types";

type ProviderCardProps = {
  locale: Locale;
  provider: Provider;
  category: Category | null;
  zones: Zone[];
  highlighted?: boolean;
};

export function ProviderCard({ locale, provider, category, zones, highlighted = false }: ProviderCardProps) {
  const zoneNames = zones.map((zone) => getLocalizedValue(zone.name, locale)).join(locale === "ar" ? " • " : " • ");
  const provinceName = zones[0] ? getLocalizedValue(zones[0].provinceName, locale) : locale === "ar" ? "غير محدد" : "Non defini";
  const priceLabel =
    provider.profileType === "home_business"
      ? locale === "ar"
        ? "السعر الابتدائي"
        : "Prix de depart"
      : locale === "ar"
        ? "الساعة"
        : "Tarif";
  const primaryActionLabel =
    provider.profileType === "home_business"
      ? locale === "ar"
        ? "اطلب الآن"
        : "Commander"
      : locale === "ar"
        ? "احجز الآن"
        : "Réserver";

  return (
    <article
      className={`surface-card gradient-frame flex h-full flex-col gap-5 rounded-[1.75rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(227,238,255,0.94))] p-5 shadow-[0_26px_60px_rgba(12,40,104,0.14)] transition-all ${
        highlighted ? "ring-2 ring-[rgba(20,92,255,0.45)] shadow-[0_30px_70px_rgba(12,40,104,0.2)]" : ""
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="h-20 w-20 overflow-hidden rounded-3xl bg-[var(--soft)] ring-1 ring-[rgba(15,95,255,0.1)]">
          <Image src={provider.profilePhotoUrl} alt={provider.displayName} width={160} height={120} className="h-full w-full object-cover" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {provider.isVerified ? (
              <span className="status-pill status-pill--verified">{locale === "ar" ? "موثّق" : "Vérifié"}</span>
            ) : (
              <span className="status-pill status-pill--pending">{locale === "ar" ? "قيد المراجعة" : "En attente"}</span>
            )}

            {provider.featured ? (
              <span className="status-pill border border-[var(--line)] bg-white text-[var(--ink)]">
                {locale === "ar" ? "مقترح" : "Recommandé"}
              </span>
            ) : null}
          </div>

          <h3 className={`text-xl font-extrabold tracking-tight ${locale === "ar" ? "arabic-display" : ""}`}>{provider.displayName}</h3>
          <p className="mt-1 text-[0.98rem] font-medium text-[var(--muted)]">
            {category ? `${category.icon} ${getLocalizedValue(category.name, locale)}` : provider.categorySlug}
          </p>
          <p className="mt-3 text-[0.98rem] leading-8 text-[var(--muted)]">{getLocalizedValue(provider.shortTagline, locale)}</p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3 text-[0.98rem]">
        <div className="stat-card rounded-2xl p-3">
          <dt className="text-[var(--muted)]">{locale === "ar" ? "التقييم" : "Note"}</dt>
          <dd className="mt-1 font-bold">{provider.rating.toFixed(1)} / 5</dd>
        </div>
        <div className="stat-card rounded-2xl p-3">
          <dt className="text-[var(--muted)]">{locale === "ar" ? "الأعمال" : "Missions"}</dt>
          <dd className="mt-1 font-bold">{formatNumber(provider.completedJobs, locale)}</dd>
        </div>
        <div className="stat-card rounded-2xl p-3">
          <dt className="text-[var(--muted)]">{locale === "ar" ? "الرد" : "Réponse"}</dt>
          <dd className="mt-1 font-bold">{formatResponseTime(provider.responseTimeMinutes, locale)}</dd>
        </div>
        <div className="stat-card rounded-2xl p-3">
          <dt className="text-[var(--muted)]">{priceLabel}</dt>
          <dd className="mt-1 font-bold">{formatCurrency(provider.hourlyRate, locale)}</dd>
        </div>
      </dl>

      <div className="space-y-2 rounded-2xl border border-[rgba(15,95,255,0.12)] bg-white/88 p-4 text-[0.98rem] leading-7 text-[var(--muted)]">
        <div>
          <span className="font-semibold text-[var(--ink)]">{locale === "ar" ? "الولاية:" : "Wilaya :"}</span> {provinceName}
        </div>
        <div>
          <span className="font-semibold text-[var(--ink)]">{locale === "ar" ? "المدن والمناطق:" : "Villes et zones :"}</span> {zoneNames}
        </div>
        <div>
          <span className="font-semibold text-[var(--ink)]">{locale === "ar" ? "رسوم التنقل:" : "Déplacement :"}</span>{" "}
          {formatCurrency(provider.travelFee, locale)}
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-3 sm:flex-row">
        <Link href={`/${locale}/providers/${provider.slug}`} className="button-secondary flex-1">
          {locale === "ar" ? "عرض الملف" : "Voir le profil"}
        </Link>
        <Link href={`/${locale}/book/${provider.slug}`} className="button-primary flex-1">
          {primaryActionLabel}
        </Link>
      </div>
    </article>
  );
}
