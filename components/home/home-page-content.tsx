import Link from "next/link";
import { HomeSearchForm } from "@/components/home/home-search-form";
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
      businesses: string;
      grow: string;
    };
    home: {
      badge: string;
      title: string;
      description: string;
      searchPlaceholder: string;
      provinceLabel: string;
      zoneLabel: string;
      categoryLabel: string;
      lanesTitle: string;
      servicesLaneTitle: string;
      servicesLaneDescription: string;
      servicesLaneCta: string;
      businessesLaneTitle: string;
      businessesLaneDescription: string;
      businessesLaneCta: string;
      featuredTitle: string;
      featuredDescription: string;
      businessFeaturedTitle: string;
      businessFeaturedDescription: string;
      growTitle: string;
      growDescription: string;
      growCta: string;
      growSoon: string;
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
  featuredBusinesses: Provider[];
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
  featuredBusinesses,
  summary,
}: HomePageContentProps) {
  const categoryMap = new Map(categories.map((category) => [category.slug, category]));
  const zoneMap = new Map(zones.map((zone) => [zone.slug, zone]));
  const serviceCategories = categories.filter((category) => category.lane === "service_provider");
  const businessCategories = categories.filter((category) => category.lane === "home_business");
  const provinces = Array.from(new Map(zones.map((zone) => [zone.provinceSlug, zone.provinceName])).entries()).map(
    ([slug, name]) => ({
      slug,
      name,
      zones: zones.filter((zone) => zone.provinceSlug === slug),
    }),
  );

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-14 px-4 py-8 sm:px-6 lg:gap-16 lg:px-8 lg:py-10">
      <section id="hero" className="surface-card hero-shell gradient-frame relative overflow-hidden rounded-[2rem] p-5 text-white sm:p-7 lg:p-10">
        <div className="hero-orb -left-10 top-8 h-44 w-44 bg-[rgba(125,180,255,0.46)]" />
        <div className="hero-orb right-10 top-16 h-40 w-40 bg-[rgba(255,255,255,0.22)]" />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:items-start">
          <div>
            <span className="inline-flex rounded-full border border-white/18 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-white/84 shadow-[0_10px_24px_rgba(8,18,37,0.14)] backdrop-blur">
              {dictionary.home.badge}
            </span>

            <h1
              className={`mt-5 max-w-3xl text-4xl font-extrabold leading-tight tracking-[-0.05em] sm:text-5xl lg:text-6xl ${
                locale === "ar" ? "arabic-display" : ""
              }`}
            >
              {dictionary.home.title}
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-white/80 sm:text-lg">
              {dictionary.home.description}
            </p>

            <div className="mt-8 space-y-4">
              <div className="text-sm font-semibold uppercase tracking-[0.14em] text-white/72">{dictionary.home.lanesTitle}</div>
              <div className="grid gap-4 lg:grid-cols-2">
                <Link
                  href={`/${locale}/providers`}
                  className="rounded-[1.75rem] border border-white/16 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.08))] p-5 shadow-[0_24px_48px_rgba(8,18,37,0.18)] backdrop-blur"
                >
                  <div className="text-sm font-semibold text-white/70">{locale === "ar" ? "المسار الأول" : "Volet 1"}</div>
                  <div className={`mt-2 text-2xl font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{dictionary.home.servicesLaneTitle}</div>
                  <p className="mt-3 text-sm leading-7 text-white/78">{dictionary.home.servicesLaneDescription}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {serviceCategories.slice(0, 4).map((category) => (
                      <span key={category.slug} className="chip-button border-white/14 bg-white/10 text-white text-xs">
                        {category.icon} {getLocalizedValue(category.name, locale)}
                      </span>
                    ))}
                  </div>
                  <div className="mt-5 text-sm font-bold text-white">{dictionary.home.servicesLaneCta}</div>
                </Link>

                <Link
                  href={`/${locale}/businesses`}
                  className="rounded-[1.75rem] border border-white/16 bg-[linear-gradient(180deg,rgba(180,220,255,0.2),rgba(255,255,255,0.08))] p-5 shadow-[0_24px_48px_rgba(8,18,37,0.18)] backdrop-blur"
                >
                  <div className="text-sm font-semibold text-white/70">{locale === "ar" ? "المسار الثاني" : "Volet 2"}</div>
                  <div className={`mt-2 text-2xl font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{dictionary.home.businessesLaneTitle}</div>
                  <p className="mt-3 text-sm leading-7 text-white/78">{dictionary.home.businessesLaneDescription}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {businessCategories.slice(0, 4).map((category) => (
                      <span key={category.slug} className="chip-button border-white/14 bg-white/10 text-white text-xs">
                        {category.icon} {getLocalizedValue(category.name, locale)}
                      </span>
                    ))}
                  </div>
                  <div className="mt-5 text-sm font-bold text-white">{dictionary.home.businessesLaneCta}</div>
                </Link>
              </div>
            </div>

            <HomeSearchForm
              locale={locale}
              zones={zones}
              labels={{
                search: dictionary.common.search,
                searchPlaceholder: dictionary.home.searchPlaceholder,
                provinceLabel: dictionary.home.provinceLabel,
                zoneLabel: dictionary.home.zoneLabel,
              }}
            />

            <div className="mt-4 flex flex-wrap gap-3">
              <Link href={`/${locale}/providers`} className="button-secondary border-white/18 bg-white/10 text-white shadow-[0_18px_36px_rgba(8,18,37,0.18)]">
                {dictionary.nav.providers}
              </Link>
              <Link href={`/${locale}/businesses`} className="button-secondary border-white/18 bg-white/10 text-white shadow-[0_18px_36px_rgba(8,18,37,0.18)]">
                {dictionary.nav.businesses}
              </Link>
              <Link href={`/${locale}/grow`} className="button-secondary border-white/18 bg-white/10 text-white shadow-[0_18px_36px_rgba(8,18,37,0.18)]">
                {dictionary.nav.grow}
              </Link>
              <Link href={`/${locale}/join`} className="button-primary">
                {dictionary.home.joinCta}
              </Link>
            </div>

            <div className="mt-7">
              <div className="mb-3 text-sm font-semibold text-white/72">{dictionary.home.categoryLabel}</div>
              <div className="flex gap-3 overflow-x-auto pb-2" aria-label={dictionary.home.categoryLabel}>
                {serviceCategories.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/${locale}/providers?category=${category.slug}`}
                    className="chip-button border-white/14 bg-white/10 text-white shadow-[0_10px_24px_rgba(8,18,37,0.12)] text-sm"
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
              <div className="rounded-[1.5rem] border border-white/14 bg-white/10 p-5 shadow-[0_18px_34px_rgba(8,18,37,0.14)] backdrop-blur">
                <div className="text-sm text-white/72">{dictionary.home.statsProviders}</div>
                <div className="mt-2 text-3xl font-extrabold text-white">{summary.providersCount}</div>
              </div>
              <div className="rounded-[1.5rem] border border-white/14 bg-white/10 p-5 shadow-[0_18px_34px_rgba(8,18,37,0.14)] backdrop-blur">
                <div className="text-sm text-white/72">{dictionary.home.statsZones}</div>
                <div className="mt-2 text-3xl font-extrabold text-white">{summary.zonesCount}</div>
              </div>
              <div className="rounded-[1.5rem] border border-white/14 bg-white/10 p-5 shadow-[0_18px_34px_rgba(8,18,37,0.14)] backdrop-blur">
                <div className="text-sm text-white/72">{dictionary.home.statsCategories}</div>
                <div className="mt-2 text-3xl font-extrabold text-white">{summary.categoriesCount}</div>
              </div>
            </div>

            <div className="surface-card rounded-[1.75rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(223,235,255,0.92))] p-5 sm:p-6">
              <div className="flex flex-col gap-5">
                <div>
                  <div className="text-sm font-semibold text-[var(--muted)]">{dictionary.home.provinceLabel}</div>
                  <div className="mt-2 text-2xl font-extrabold tracking-tight">
                    {locale === "ar" ? "اختر الولاية ثم المدينة الأقرب إليك" : "Choisissez la wilaya puis la ville la plus proche"}
                  </div>
                </div>

                <div className="grid gap-4">
                  {provinces.map((province) => (
                    <div key={province.slug} className="rounded-[1.5rem] border border-[rgba(15,95,255,0.12)] bg-[var(--soft)] p-4 shadow-[0_10px_24px_rgba(15,95,255,0.06)]">
                      <div className="text-base font-extrabold text-[var(--ink)]">{getLocalizedValue(province.name, locale)}</div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        {province.zones.map((zone) => (
                          <Link
                            key={zone.slug}
                            href={`/${locale}/providers?province=${province.slug}&zone=${zone.slug}`}
                            className="rounded-[1.15rem] border border-[rgba(15,95,255,0.12)] bg-white px-4 py-4 shadow-[0_10px_24px_rgba(15,95,255,0.06)] transition hover:-translate-y-0.5 hover:border-[rgba(15,95,255,0.24)]"
                          >
                            <div className="text-sm font-bold">{getLocalizedValue(zone.name, locale)}</div>
                            <div className="mt-1 text-xs text-[var(--muted)]">
                              {locale === "ar" ? "اعرض الحرفيين المتاحين" : "Voir les prestataires disponibles"}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-[1.25rem] border border-[rgba(20,92,255,0.14)] bg-[linear-gradient(180deg,rgba(208,225,255,0.82),rgba(255,255,255,0.95))] px-4 py-4 text-sm leading-7 text-[var(--muted)]">
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

      <section id="featured-businesses" className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className={`section-title font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>
              {dictionary.home.businessFeaturedTitle}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
              {dictionary.home.businessFeaturedDescription}
            </p>
          </div>
          <Link href={`/${locale}/businesses`} className="button-secondary">
            {dictionary.common.viewAll}
          </Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {featuredBusinesses.map((provider) => (
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

      <section id="join-henini" className="surface-card rounded-[2rem] bg-[linear-gradient(135deg,rgba(13,28,69,0.98),rgba(20,92,255,0.92)_70%,rgba(83,146,255,0.9))] p-6 text-white sm:p-8">
        <div className="mb-6 rounded-[1.5rem] border border-white/12 bg-white/10 p-5 backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.14em] text-white/72">{dictionary.nav.grow}</div>
              <h2 className={`mt-2 text-2xl font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>
                {dictionary.home.growTitle}
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-8 text-white/82">{dictionary.home.growDescription}</p>
            </div>
            <div className="flex flex-col gap-3 lg:max-w-sm">
              <span className="rounded-[1.25rem] border border-white/14 bg-[rgba(8,18,37,0.18)] px-4 py-3 text-sm font-semibold text-white/84">
                {dictionary.home.growSoon}
              </span>
              <Link href={`/${locale}/grow`} className="button-secondary border-white/20 bg-white/12 text-white shadow-[0_18px_36px_rgba(8,18,37,0.18)]">
                {dictionary.home.growCta}
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div>
            <h2 className={`section-title font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>
              {dictionary.home.joinTitle}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-white/82">
              {dictionary.home.joinDescription}
            </p>
          </div>
          <Link href={`/${locale}/join`} className="button-secondary border-white/20 bg-white/12 text-white shadow-[0_18px_36px_rgba(8,18,37,0.18)]">
            {dictionary.home.joinCta}
          </Link>
        </div>
      </section>
    </div>
  );
}
