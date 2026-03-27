import Image from "next/image";
import Link from "next/link";
import { HeroCtaCards } from "@/components/HeroCtaCards";
import { JourneySection } from "@/components/JourneySection";
import { RoleBanner } from "@/components/RoleBanner";
import { HomeSearchForm } from "@/components/home/home-search-form";
import { ProviderCard } from "@/components/providers/provider-card";
import { getLocalizedValue } from "@/lib/i18n";
import { getGrowthStage, getOpportunityTypes, getProviderReadiness, isMentorReady } from "@/lib/provider-growth";
import type { Category, Locale, Provider, Zone } from "@/lib/types";

type HomePageContentProps = {
  locale: Locale;
  dictionary: {
    common: {
      search: string;
      viewAll: string;
      verified: string;
      featured: string;
    };
    nav: {
      providers: string;
      businesses: string;
      grow: string;
      safety: string;
    };
    grow: {
      laneService: string;
      laneBusiness: string;
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
      clarityEyebrow: string;
      clarityTitle: string;
      clarityTagline: string;
      whatTitle: string;
      whatBody: string;
      whoTitle: string;
      whoItems: string[];
      howTitle: string;
      howSteps: string[];
      whyTitle: string;
      whyItems: string[];
      featuredTitle: string;
      featuredDescription: string;
      businessFeaturedTitle: string;
      businessFeaturedDescription: string;
      growTitle: string;
      growDescription: string;
      growCta: string;
      growSoon: string;
      safetyTitle: string;
      safetyDescription: string;
      safetyCta: string;
      spotlightTitle: string;
      spotlightDescription: string;
      joinTitle: string;
      joinDescription: string;
      joinCta: string;
      statsProviders: string;
      statsZones: string;
      statsCategories: string;
    };
    roleBanner: { providerLabel: string; providerTitle: string; providerSub: string; seekerLabel: string; seekerTitle: string; seekerSub: string; divider: string; };
    heroCtaCards: { providerMicro: string; providerTitle: string; seekerMicro: string; seekerTitle: string; };
    journey: { eyebrow: string; headline: string; sub: string; providerRole: string; providerTitle: string; providerDesc: string; providerCta: string; seekerRole: string; seekerTitle: string; seekerDesc: string; seekerCta: string; legalPrefix: string; termsLink: string; privacyLink: string; conductLink: string; };
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
  const spotlightProfiles = [...featuredProviders.slice(0, 1), ...featuredBusinesses.slice(0, 2)];
  const opportunityLabels = {
    individual_customers: locale === "ar" ? "زبائن أفراد" : "Clients particuliers",
    repeat_clients: locale === "ar" ? "زبائن متكررون" : "Clients récurrents",
    occasion_orders: locale === "ar" ? "طلبات مناسبات" : "Commandes d'occasion",
    business_buyers: locale === "ar" ? "مشترون مهنيون" : "Acheteurs professionnels",
    bulk_ready: locale === "ar" ? "جاهز للكميات" : "Prêt au volume",
  };
  const stageLabels = {
    starting: locale === "ar" ? "في بداية المسار" : "Début de parcours",
    building: locale === "ar" ? "يبني حضوره" : "Profil en construction",
    trusted: locale === "ar" ? "موثوق ويتقدم" : "Fiable et en progression",
    thriving: locale === "ar" ? "موثوق ويزدهر" : "Trusted and thriving",
  };

  return (
    <>
      <RoleBanner locale={locale} t={dictionary.roleBanner} providerHref={`/${locale}/join`} seekerHref={`/${locale}/providers`} />
    <div className="mx-auto flex w-full max-w-7xl min-w-0 flex-col gap-14 px-4 py-8 sm:px-6 lg:gap-16 lg:px-8 lg:py-10">
      <section id="hero" className="surface-card hero-shell gradient-frame relative isolate w-full max-w-full overflow-hidden rounded-[2rem] p-4 text-white sm:p-7 lg:p-10">
        <div className="hero-orb -left-6 top-4 h-28 w-28 bg-[rgba(125,180,255,0.42)] sm:-left-10 sm:top-8 sm:h-44 sm:w-44" />
        <div className="hero-orb right-2 top-4 h-24 w-24 bg-[rgba(255,255,255,0.14)] sm:right-10 sm:top-16 sm:h-40 sm:w-40" />
        <div className="relative z-[1] grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:items-start lg:gap-8">
          <div className="min-w-0">
            <span className="inline-flex rounded-full border border-white/12 bg-[rgba(8,23,69,0.34)] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-white shadow-[0_10px_24px_rgba(8,18,37,0.22)] backdrop-blur">
              {dictionary.home.badge}
            </span>

            <h1
              className={`mt-5 max-w-3xl text-4xl font-extrabold leading-tight tracking-[-0.05em] sm:text-5xl lg:text-6xl ${
                locale === "ar" ? "arabic-display" : ""
              }`}
            >
              {dictionary.home.title}
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-white/88 sm:text-lg">
              {dictionary.home.description}
            </p>

            <HeroCtaCards locale={locale} t={dictionary.heroCtaCards} providerHref={`/${locale}/join`} seekerHref={`/${locale}/providers`} />

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
              <Link href={`/${locale}/providers`} className="button-secondary border-white/10 bg-[rgba(8,23,69,0.34)] text-white shadow-[0_18px_36px_rgba(8,18,37,0.2)]">
                {dictionary.nav.providers}
              </Link>
              <Link href={`/${locale}/businesses`} className="button-secondary border-white/10 bg-[rgba(8,23,69,0.34)] text-white shadow-[0_18px_36px_rgba(8,18,37,0.2)]">
                {dictionary.nav.businesses}
              </Link>
              <Link href={`/${locale}/grow`} className="button-secondary border-white/10 bg-[rgba(8,23,69,0.34)] text-white shadow-[0_18px_36px_rgba(8,18,37,0.2)]">
                {dictionary.nav.grow}
              </Link>
              <Link href={`/${locale}/safety`} className="button-secondary border-white/10 bg-[rgba(8,23,69,0.34)] text-white shadow-[0_18px_36px_rgba(8,18,37,0.2)]">
                {dictionary.nav.safety}
              </Link>
              <Link href={`/${locale}/join`} className="button-primary">
                {dictionary.home.joinCta}
              </Link>
            </div>

            <div className="mt-7">
              <div className="mb-3 text-sm font-semibold text-white/82">{dictionary.home.categoryLabel}</div>
              <div className="flex flex-wrap gap-3 pb-2" aria-label={dictionary.home.categoryLabel}>
                {serviceCategories.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/${locale}/providers?category=${category.slug}`}
                    className="chip-button max-w-full border-white/10 bg-[rgba(8,23,69,0.34)] text-sm text-white shadow-[0_10px_24px_rgba(8,18,37,0.18)]"
                  >
                    <span>{category.icon}</span>
                    <span>{getLocalizedValue(category.name, locale)}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="grid min-w-0 gap-4">
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-3">
              <div className="rounded-[1.5rem] border border-white/10 bg-[rgba(8,23,69,0.32)] p-5 shadow-[0_18px_34px_rgba(8,18,37,0.18)] backdrop-blur">
                <div className="text-sm text-white/82">{dictionary.home.statsProviders}</div>
                <div className="mt-2 text-3xl font-extrabold text-white">{summary.providersCount}</div>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-[rgba(8,23,69,0.32)] p-5 shadow-[0_18px_34px_rgba(8,18,37,0.18)] backdrop-blur">
                <div className="text-sm text-white/82">{dictionary.home.statsZones}</div>
                <div className="mt-2 text-3xl font-extrabold text-white">{summary.zonesCount}</div>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-[rgba(8,23,69,0.32)] p-5 shadow-[0_18px_34px_rgba(8,18,37,0.18)] backdrop-blur">
                <div className="text-sm text-white/82">{dictionary.home.statsCategories}</div>
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

      <section className="grid gap-5 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <article className="surface-card rounded-[2rem] bg-[linear-gradient(135deg,rgba(255,255,255,0.99),rgba(227,239,255,0.96)_58%,rgba(206,225,255,0.92))] p-6 text-[var(--ink)] shadow-[0_24px_60px_rgba(12,40,104,0.16)] sm:p-7">
          <div className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{dictionary.home.clarityEyebrow}</div>
          <h2 className={`mt-3 text-2xl font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{dictionary.home.clarityTitle}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ink)]">{dictionary.home.clarityTagline}</p>

          <div className="mt-6 rounded-[1.5rem] border border-[rgba(15,95,255,0.12)] bg-white px-5 py-5 shadow-[0_12px_28px_rgba(15,95,255,0.06)]">
            <div className="text-sm font-semibold text-[var(--muted)]">{dictionary.home.whatTitle}</div>
            <p className="mt-2 text-base font-semibold leading-8 text-[var(--ink)]">{dictionary.home.whatBody}</p>
          </div>

          <div className="mt-5 rounded-[1.5rem] border border-[rgba(15,95,255,0.12)] bg-[var(--soft)] px-5 py-5 shadow-[0_10px_24px_rgba(15,95,255,0.06)]">
            <div className="text-sm font-semibold text-[var(--muted)]">{dictionary.home.whoTitle}</div>
            <div className="mt-3 grid gap-3">
              {dictionary.home.whoItems.map((item) => (
                <div key={item} className="rounded-[1.15rem] border border-[rgba(15,95,255,0.12)] bg-white px-4 py-4 text-sm leading-7 text-[var(--ink)]">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="surface-card rounded-[2rem] p-6 sm:p-7">
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-[1.6rem] border border-[rgba(15,95,255,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(232,242,255,0.9))] p-5 shadow-[0_14px_32px_rgba(15,95,255,0.08)]">
              <div className="text-sm font-semibold text-[var(--muted)]">{dictionary.home.howTitle}</div>
              <div className="mt-4 grid gap-3">
                {dictionary.home.howSteps.map((step, index) => (
                  <div key={step} className="flex items-start gap-3 rounded-[1.15rem] border border-[rgba(15,95,255,0.12)] bg-white px-4 py-4 shadow-[0_10px_24px_rgba(15,95,255,0.06)]">
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--navy)] text-sm font-extrabold text-white">
                      {index + 1}
                    </span>
                    <p className="text-sm leading-7 text-[var(--ink)]">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-[rgba(15,95,255,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(232,242,255,0.9))] p-5 shadow-[0_14px_32px_rgba(15,95,255,0.08)]">
              <div className="text-sm font-semibold text-[var(--muted)]">{dictionary.home.whyTitle}</div>
              <div className="mt-4 grid gap-3">
                {dictionary.home.whyItems.map((item) => (
                  <div key={item} className="rounded-[1.15rem] border border-[rgba(15,95,255,0.12)] bg-white px-4 py-4 text-sm leading-7 text-[var(--ink)] shadow-[0_10px_24px_rgba(15,95,255,0.06)]">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </article>
      </section>

      {/* ── Work Showcase Strip ── */}
      {(() => {
        const showcasePhotos = [...featuredProviders, ...featuredBusinesses]
          .flatMap((p) =>
            p.gallery.slice(0, 2).map((url) => ({
              url,
              providerName: p.displayName,
              providerSlug: p.slug,
              categorySlug: p.categorySlug,
            })),
          )
          .slice(0, 12);

        if (showcasePhotos.length === 0) return null;

        return (
          <section aria-label={locale === "ar" ? "معرض أعمال حديثة" : "Réalisations récentes"}>
            <div className="mb-4 flex items-end justify-between gap-4">
              <h2 className={`text-xl font-extrabold tracking-tight ${locale === "ar" ? "arabic-display" : ""}`}>
                {locale === "ar" ? "أعمال حديثة" : "Réalisations récentes"}
              </h2>
              <Link href={`/${locale}/providers`} className="text-sm font-semibold text-[var(--accent)] hover:underline">
                {dictionary.common.viewAll}
              </Link>
            </div>
            <div className="mobile-pill-scroll gap-3 pb-1">
              {showcasePhotos.map((item, idx) => (
                <Link
                  key={`${item.providerSlug}-${idx}`}
                  href={`/${locale}/providers/${item.providerSlug}`}
                  className="group relative h-[180px] w-[240px] shrink-0 overflow-hidden rounded-[1.25rem] border border-[var(--line)] bg-[var(--soft)] shadow-[0_12px_28px_rgba(12,40,104,0.1)]"
                  aria-label={item.providerName}
                >
                  <Image
                    src={item.url}
                    alt={item.providerName}
                    fill
                    sizes="240px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgba(5,12,35,0.78)] to-transparent px-3 pb-3 pt-8">
                    <p className="truncate text-xs font-bold text-white">{item.providerName}</p>
                    <p className="mt-0.5 text-[0.7rem] text-white/70">
                      {categoryMap.get(item.categorySlug)
                        ? `${categoryMap.get(item.categorySlug)!.icon} ${getLocalizedValue(categoryMap.get(item.categorySlug)!.name, locale)}`
                        : item.categorySlug}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })()}

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

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <article className="surface-card rounded-[2rem] bg-[linear-gradient(135deg,rgba(255,255,255,0.99),rgba(227,239,255,0.96)_58%,rgba(206,225,255,0.92))] p-6 text-[var(--ink)] shadow-[0_26px_60px_rgba(12,40,104,0.18)] sm:p-7">
          <div className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--ink)]">{dictionary.nav.safety}</div>
          <h2 className={`mt-3 text-2xl font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{dictionary.home.safetyTitle}</h2>
          <p className="mt-4 max-w-2xl text-sm leading-8 text-[var(--ink)]">{dictionary.home.safetyDescription}</p>
          <div className="mt-5 grid gap-3">
            {[
              locale === "ar" ? "الإبلاغ عن التحرش أو التواصل غير المناسب" : "Signaler un harcèlement ou un contact inapproprié",
              locale === "ar" ? "حماية الخصوصية للأنشطة المنزلية الحساسة" : "Mieux protéger les activités à domicile sensibles",
              locale === "ar" ? "فتح طلب دعم مع متابعة واضحة داخل لوحة الإدارة" : "Ouvrir un ticket avec suivi clair côté admin",
            ].map((item) => (
              <div key={item} className="rounded-[1.25rem] border border-[rgba(15,95,255,0.12)] bg-white px-4 py-3 text-sm leading-7 text-[var(--ink)]">
                {item}
              </div>
            ))}
          </div>
          <Link href={`/${locale}/safety`} className="button-secondary mt-6">
            {dictionary.home.safetyCta}
          </Link>
        </article>

        <article className="surface-card rounded-[2rem] p-6 sm:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{locale === "ar" ? "قصص نجاح" : "Success stories"}</div>
              <h2 className={`mt-2 text-2xl font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{dictionary.home.spotlightTitle}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">{dictionary.home.spotlightDescription}</p>
            </div>
            <Link href={`/${locale}/grow`} className="button-secondary">
              {dictionary.nav.grow}
            </Link>
          </div>

          <div className="mt-6 grid gap-4">
            {spotlightProfiles.map((provider) => {
              const spotlightZones = provider.zones.map((slug) => zoneMap.get(slug)).filter((zone): zone is Zone => Boolean(zone));
              const primaryZone = spotlightZones[0];
              const readiness = getProviderReadiness(provider);
              const opportunities = getOpportunityTypes(provider).slice(0, 3);
              const stage = getGrowthStage(provider);
              const storyTitle =
                provider.profileType === "home_business"
                  ? locale === "ar"
                    ? "نشاط منزلي يكسب ثقة الزبائن خطوة بخطوة"
                    : "Une activité à domicile qui gagne la confiance pas à pas"
                  : locale === "ar"
                    ? "مزود خدمة يبني سمعته من أعمال واضحة وموثوقة"
                    : "Un prestataire qui construit sa réputation avec des preuves concrètes";
              const storyHighlight =
                provider.profileType === "home_business"
                  ? locale === "ar"
                    ? "جاهز لطلبات المناسبات أو المشترين الذين يحتاجون كميات أكبر."
                    : "Prêt pour des commandes d'occasion ou des acheteurs à plus grand volume."
                  : locale === "ar"
                    ? "يتقدم عبر جودة الأعمال، سرعة الرد، وثقة متزايدة من الزبائن."
                    : "Progresse grâce à la qualité du travail, à une réponse claire et à la confiance des clients.";
              return (
                <div key={provider.id} className="rounded-[1.5rem] border border-[rgba(15,95,255,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(231,240,255,0.9))] p-5 shadow-[0_18px_40px_rgba(15,95,255,0.08)]">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="status-pill status-pill--verified">{provider.isVerified ? dictionary.common.verified : dictionary.common.featured}</span>
                    <span className="chip-button min-h-0 px-3 py-2 text-xs">
                      {provider.profileType === "home_business" ? dictionary.nav.businesses : dictionary.nav.providers}
                    </span>
                    <span className="chip-button min-h-0 px-3 py-2 text-xs">{stageLabels[stage]}</span>
                    {provider.profileType === "home_business" && provider.bulkOrders?.available ? (
                      <span className="chip-button min-h-0 px-3 py-2 text-xs">{locale === "ar" ? "جاهز للكميات" : "Prêt au volume"}</span>
                    ) : null}
                  </div>
                  <h3 className={`mt-3 text-xl font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{provider.displayName}</h3>
                  <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{getLocalizedValue(provider.shortTagline, locale)}</p>
                  <div className="mt-4 rounded-[1.25rem] border border-[rgba(15,95,255,0.12)] bg-white px-4 py-4 text-sm text-[var(--muted)]">
                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand)]">
                      {locale === "ar" ? "قصة نمو قصيرة" : "Courte histoire de progression"}
                    </div>
                    <div className="mt-2 font-semibold text-[var(--ink)]">{storyTitle}</div>
                    <p className="mt-2 leading-7">
                      {locale === "ar"
                        ? `هذا الملف بنى حضوره من خلال ${provider.completedJobs} طلباً منجزاً، تقييم ${provider.rating.toFixed(1)}، وصور أو أدلة عملية تساعد الزبون على الثقة قبل التواصل.`
                        : `Ce profil a renforcé sa présence grâce à ${provider.completedJobs} demandes accomplies, une note de ${provider.rating.toFixed(1)} et des preuves concrètes qui rassurent avant la prise de contact.`}
                    </p>
                    <p className="mt-2 leading-7 text-[var(--ink)]">{storyHighlight}</p>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                    {locale === "ar"
                      ? `بنى هذا الملف حضوره بثبات من خلال ${provider.completedJobs} طلباً، تقييم ${provider.rating.toFixed(1)}، وخدمة واضحة في ${primaryZone ? getLocalizedValue(primaryZone.name, locale) : "منطقته"}.`
                      : `Ce profil se distingue par ${provider.completedJobs} demandes accomplies, une note de ${provider.rating.toFixed(1)} et une présence claire autour de ${primaryZone ? getLocalizedValue(primaryZone.name, locale) : "sa zone"}.`}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {spotlightZones.slice(0, 3).map((zone) => (
                      <span key={zone.slug} className="chip-button min-h-0 px-3 py-2 text-xs">
                        {getLocalizedValue(zone.name, locale)}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 rounded-[1.25rem] border border-[rgba(15,95,255,0.12)] bg-white px-4 py-4 text-sm text-[var(--muted)]">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="font-semibold text-[var(--ink)]">
                        {locale === "ar" ? "جاهزية الملف" : "Niveau de préparation"}
                      </span>
                      <span className="status-pill border border-[var(--line)] bg-[var(--soft)] text-[var(--ink)]">
                        {readiness.score}%
                      </span>
                    </div>
                    <div className="mt-3 overflow-hidden rounded-full bg-[rgba(15,95,255,0.08)]">
                      <div
                        className="h-2 rounded-full bg-[linear-gradient(90deg,#0f5fff,#4f8dff)]"
                        style={{ width: `${Math.max(readiness.score, 8)}%` }}
                        aria-hidden="true"
                      />
                    </div>
                    <p className="mt-2 leading-7">
                      {locale === "ar"
                        ? `هذا الملف أكمل ${readiness.completed} من ${readiness.total} عناصر تساعده على الظهور، الثقة، والحصول على فرص أفضل.`
                        : `Ce profil a déjà complété ${readiness.completed} éléments sur ${readiness.total} pour gagner en visibilité, confiance et opportunités.`}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {opportunities.map((key) => (
                        <span key={key} className="chip-button min-h-0 px-3 py-2 text-xs">
                          {opportunityLabels[key]}
                        </span>
                      ))}
                      {provider.gallery.length > 0 ? (
                        <span className="chip-button min-h-0 px-3 py-2 text-xs">
                          {locale === "ar" ? `${provider.gallery.length} صور أعمال` : `${provider.gallery.length} visuels`}
                        </span>
                      ) : null}
                      {isMentorReady(provider) ? (
                        <span className="chip-button min-h-0 px-3 py-2 text-xs">
                          {locale === "ar" ? "جاهز للإلهام والإرشاد" : "Prêt à inspirer d'autres profils"}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      </section>

      <section className="surface-card rounded-[2rem] p-6 sm:p-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              {locale === "ar" ? "مسارات الفرص" : "Types d'opportunités"}
            </div>
            <h2 className={`mt-2 text-2xl font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>
              {locale === "ar" ? "هَنّيني يساعدك تنتقل من أول طلب إلى فرص أوضح وأكبر" : "Hannini aide à passer du premier client à des opportunités plus solides"}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)]">
              {locale === "ar"
                ? "المسار لا يتوقف عند الظهور في السوق: الملف الجيد، الصور الواضحة، الثقة، وسرعة الرد تفتح المجال لزبائن متكررين، طلبات مناسبات، ومشترين مهنيين."
                : "Le parcours ne s'arrête pas à la mise en ligne: un bon profil, de vraies photos, la confiance et une réponse claire ouvrent la porte à des clients récurrents, aux commandes d'occasion et à des acheteurs professionnels."}
            </p>
          </div>
          <Link href={`/${locale}/grow`} className="button-secondary">
            {dictionary.nav.grow}
          </Link>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-4">
          {[
            {
              title: locale === "ar" ? "أول زبون" : "Premier client",
              body:
                locale === "ar"
                  ? "ابدأ بملف واضح وصور جيدة ورد سريع حتى تظهر بجدية."
                  : "Commencez avec un profil clair, de bonnes photos et une réponse rapide.",
            },
            {
              title: locale === "ar" ? "زبائن متكررون" : "Clients récurrents",
              body:
                locale === "ar"
                  ? "الالتزام والجودة والتقييمات الجيدة يساعدانك على تحويل الطلب إلى عادة."
                  : "La régularité, la qualité et les avis aident à transformer une demande en relation durable.",
            },
            {
              title: locale === "ar" ? "طلبات مناسبات" : "Commandes d'occasion",
              body:
                locale === "ar"
                  ? "مهم خصوصاً للطبخ، الحلويات، والخياطة مع تنظيم أوضح للكميات والمواعيد."
                  : "Très utile pour cuisine, pâtisserie et couture avec meilleure organisation des quantités et délais.",
            },
            {
              title: locale === "ar" ? "مشترون مهنيون" : "Acheteurs professionnels",
              body:
                locale === "ar"
                  ? "عندما تكتمل الجاهزية والقدرة، يمكن للنشاط أن يستقبل استفسارات أكبر بثقة."
                  : "Quand le profil et la capacité sont prêts, l'activité peut accueillir des demandes plus ambitieuses.",
            },
          ].map((item) => (
            <article key={item.title} className="rounded-[1.5rem] border border-[rgba(15,95,255,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(231,240,255,0.88))] p-5 shadow-[0_14px_34px_rgba(15,95,255,0.08)]">
              <h3 className={`text-xl font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

<<<<<<< HEAD
      <JourneySection locale={locale} t={dictionary.journey} providerHref={`/${locale}/join`} seekerHref={`/${locale}/providers`} conductHref={`/${locale}/conduct`} privacyHref={`/${locale}/safety`} termsHref={`/${locale}/conduct`} />
=======
      <section id="join-henini" className="surface-card rounded-[2rem] bg-[linear-gradient(135deg,rgba(255,255,255,0.99),rgba(227,239,255,0.96)_58%,rgba(206,225,255,0.92))] p-6 text-[var(--ink)] sm:p-8">
        <div className="mb-6 rounded-[1.5rem] border border-[rgba(15,95,255,0.14)] bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(238,245,255,0.96))] p-5 shadow-[0_14px_30px_rgba(15,95,255,0.08)] backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--navy)]">{dictionary.nav.grow}</div>
              <h2 className={`mt-2 text-2xl font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>
                {dictionary.home.growTitle}
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-8 text-[var(--ink)]">{dictionary.home.growDescription}</p>
            </div>
            <div className="flex flex-col gap-3 lg:max-w-sm">
              <span className="rounded-[1.25rem] border border-[rgba(15,95,255,0.14)] bg-white px-4 py-3 text-sm font-semibold text-[var(--navy)] shadow-[0_10px_24px_rgba(15,95,255,0.05)]">
                {dictionary.home.growSoon}
              </span>
              <Link href={`/${locale}/grow`} className="button-secondary">
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
            <p className="mt-4 max-w-2xl text-sm leading-8 text-[var(--ink)]">
              {dictionary.home.joinDescription}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-[rgba(15,95,255,0.14)] bg-white px-4 py-2 text-sm font-semibold text-[var(--navy)] shadow-[0_10px_20px_rgba(15,95,255,0.05)]">
                {dictionary.grow.laneService}
              </span>
              <span className="rounded-full border border-[rgba(15,95,255,0.14)] bg-white px-4 py-2 text-sm font-semibold text-[var(--navy)] shadow-[0_10px_20px_rgba(15,95,255,0.05)]">
                {dictionary.grow.laneBusiness}
              </span>
            </div>
          </div>
          <Link href={`/${locale}/join`} className="button-secondary">
            {dictionary.home.joinCta}
          </Link>
        </div>
      </section>
>>>>>>> 3da70f8 (Polish mobile nav and learn-grow contrast)
    </div>
    </>
  );
}
