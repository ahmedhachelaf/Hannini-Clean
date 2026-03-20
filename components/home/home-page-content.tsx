import Link from "next/link";
import { ProviderCard } from "@/components/providers/provider-card";
import { getLocalizedValue } from "@/lib/i18n";
import type { Category, Locale, Provider, Zone } from "@/lib/types";

type HomePageContentProps = {
  locale: Locale;
  dictionary: {
    common: {
      search: string;
      viewAll: string;
    };
    nav: {
      providers: string;
    };
    home: {
      badge: string;
      title: string;
      description: string;
      searchPlaceholder: string;
      zoneLabel: string;
      categoryLabel: string;
      featuredTitle: string;
      featuredDescription: string;
      joinTitle: string;
      joinDescription: string;
      joinCta: string;
      statsProviders: string;
      statsZones: string;
      statsCategories: string;
    };
  };
  categories: Category[];
  zones: Zone[];
  featuredProviders: Provider[];
  summary: {
    providersCount: number;
    zonesCount: number;
    categoriesCount: number;
  };
};

export function HomePageContent({
  locale,
  dictionary,
  categories,
  zones,
  featuredProviders,
  summary,
}: HomePageContentProps) {
  const categoryMap = new Map(categories.map((category) => [category.slug, category]));
  const zoneMap = new Map(zones.map((zone) => [zone.slug, zone]));

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-14 px-4 py-8 sm:px-6 lg:gap-16 lg:px-8 lg:py-10">
      <section id="hero" className="surface-card gradient-frame overflow-hidden rounded-[2rem] p-5 sm:p-7 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:items-start">
          <div>
            <span className="inline-flex rounded-full border border-[var(--line)] bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--muted)]">
              {dictionary.home.badge}
            </span>

            <h1
              className={`mt-5 max-w-3xl text-4xl font-extrabold leading-tight tracking-[-0.05em] sm:text-5xl lg:text-6xl ${
                locale === "ar" ? "arabic-display" : ""
              }`}
            >
              {dictionary.home.title}
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--muted)] sm:text-lg">
              {dictionary.home.description}
            </p>

            <form
              action={`/${locale}/providers`}
              className="mt-8 grid gap-3 rounded-[1.75rem] border border-[var(--line)] bg-white/95 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.04)] sm:grid-cols-[minmax(0,1fr)_220px_auto]"
            >
              <input
                name="q"
                type="search"
                className="input-base"
                placeholder={dictionary.home.searchPlaceholder}
                aria-label={dictionary.home.searchPlaceholder}
              />
              <select name="zone" className="input-base" aria-label={dictionary.home.zoneLabel}>
                <option value="">{dictionary.home.zoneLabel}</option>
                {zones.map((zone) => (
                  <option key={zone.slug} value={zone.slug}>
                    {getLocalizedValue(zone.name, locale)}
                  </option>
                ))}
              </select>
              <button type="submit" className="button-primary w-full sm:w-auto">
                {dictionary.common.search}
              </button>
            </form>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link href={`/${locale}/providers`} className="button-secondary">
                {dictionary.nav.providers}
              </Link>
              <Link href={`/${locale}/join`} className="button-primary">
                {dictionary.home.joinCta}
              </Link>
            </div>

            <div className="mt-7">
              <div className="mb-3 text-sm font-semibold text-[var(--muted)]">{dictionary.home.categoryLabel}</div>
              <div className="flex gap-3 overflow-x-auto pb-2" aria-label={dictionary.home.categoryLabel}>
                {categories.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/${locale}/providers?category=${category.slug}`}
                    className="chip-button text-sm"
                  >
                    <span>{category.icon}</span>
                    <span>{getLocalizedValue(category.name, locale)}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-3">
              <div className="surface-card rounded-[1.5rem] bg-white p-5">
                <div className="text-sm text-[var(--muted)]">{dictionary.home.statsProviders}</div>
                <div className="mt-2 text-3xl font-extrabold">{summary.providersCount}</div>
              </div>
              <div className="surface-card rounded-[1.5rem] bg-white p-5">
                <div className="text-sm text-[var(--muted)]">{dictionary.home.statsZones}</div>
                <div className="mt-2 text-3xl font-extrabold">{summary.zonesCount}</div>
              </div>
              <div className="surface-card rounded-[1.5rem] bg-white p-5">
                <div className="text-sm text-[var(--muted)]">{dictionary.home.statsCategories}</div>
                <div className="mt-2 text-3xl font-extrabold">{summary.categoriesCount}</div>
              </div>
            </div>

            <div className="surface-card rounded-[1.75rem] bg-white p-5 sm:p-6">
              <div className="flex flex-col gap-5">
                <div>
                  <div className="text-sm font-semibold text-[var(--muted)]">{dictionary.home.zoneLabel}</div>
                  <div className="mt-2 text-2xl font-extrabold tracking-tight">
                    {locale === "ar" ? "اختر المنطقة الأقرب إليك" : "Choisissez la zone la plus proche"}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {zones.map((zone) => (
                    <Link
                      key={zone.slug}
                      href={`/${locale}/providers?zone=${zone.slug}`}
                      className="rounded-[1.25rem] border border-[var(--line)] bg-[var(--soft)] px-4 py-4 transition hover:-translate-y-0.5 hover:border-[rgba(17,17,17,0.16)]"
                    >
                      <div className="text-base font-bold">{getLocalizedValue(zone.name, locale)}</div>
                      <div className="mt-1 text-sm text-[var(--muted)]">
                        {locale === "ar" ? "اعرض الحرفيين المتاحين" : "Voir les prestataires disponibles"}
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="rounded-[1.25rem] border border-[var(--line)] bg-[var(--soft)] px-4 py-4 text-sm leading-7 text-[var(--muted)]">
                  {dictionary.home.featuredDescription}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="featured-providers" className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className={`section-title font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>
              {dictionary.home.featuredTitle}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
              {dictionary.home.featuredDescription}
            </p>
          </div>
          <Link href={`/${locale}/providers`} className="button-secondary">
            {dictionary.common.viewAll}
          </Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {featuredProviders.map((provider) => (
            <ProviderCard
              key={provider.id}
              locale={locale}
              provider={provider}
              category={categoryMap.get(provider.categorySlug) ?? null}
              zones={provider.zones
                .map((slug) => zoneMap.get(slug))
                .filter((zone): zone is Zone => Boolean(zone))}
            />
          ))}
        </div>
      </section>

      <section id="join-henini" className="surface-card rounded-[2rem] p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div>
            <h2 className={`section-title font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>
              {dictionary.home.joinTitle}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-[var(--muted)]">
              {dictionary.home.joinDescription}
            </p>
          </div>
          <Link href={`/${locale}/join`} className="button-primary">
            {dictionary.home.joinCta}
          </Link>
        </div>
      </section>
    </div>
  );
}
