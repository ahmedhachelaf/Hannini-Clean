import Link from "next/link";
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
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-14 px-4 py-8 sm:px-6 lg:gap-16 lg:px-8 lg:py-10">
      <section id="hero" className="surface-card hero-shell gradient-frame relative isolate overflow-visible rounded-[2rem] p-4 text-white sm:overflow-hidden sm:p-7 lg:p-10">
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

            <div className="mt-8 space-y-4">
              <div className="text-sm font-semibold uppercase tracking-[0.14em] text-white/82">{dictionary.home.lanesTitle}</div>
              <div className="grid gap-4 lg:grid-cols-2">
                <Link
                  href={`/${locale}/providers`}
                  className="rounded-[1.75rem] border border-white/12 bg-[linear-gradient(180deg,rgba(8,23,69,0.34),rgba(15,47,126,0.24))] p-5 shadow-[0_24px_48px_rgba(8,18,37,0.2)] backdrop-blur"
                >
                  <div className="text-sm font-semibold text-white/82">{locale === "ar" ? "المسار الأول" : "Volet 1"}</div>
                  <div className={`mt-2 text-2xl font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{dictionary.home.servicesLaneTitle}</div>
                  <p className="mt-3 text-sm leading-7 text-white/88">{dictionary.home.servicesLaneDescription}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {serviceCategories.slice(0, 4).map((category) => (
                      <span key={category.slug} className="chip-button border-white/10 bg-[rgba(255,255,255,0.12)] text-white text-xs">
                        {category.icon} {getLocalizedValue(category.name, locale)}
                      </span>
                    ))}
                  </div>
                  <div className="mt-5 text-sm font-bold text-white">{dictionary.home.servicesLaneCta}</div>
                </Link>

                <Link
                  href={`/${locale}/businesses`}
                  className="rounded-[1.75rem] border border-white/12 bg-[linear-gradient(180deg,rgba(16,44,112,0.34),rgba(33,83,182,0.24))] p-5 shadow-[0_24px_48px_rgba(8,18,37,0.2)] backdrop-blur"
                >
                  <div className="text-sm font-semibold text-white/82">{locale === "ar" ? "المسار الثاني" : "Volet 2"}</div>
                  <div className={`mt-2 text-2xl font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{dictionary.home.businessesLaneTitle}</div>
                  <p className="mt-3 text-sm leading-7 text-white/88">{dictionary.home.businessesLaneDescription}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {businessCategories.slice(0, 4).map((category) => (
                      <span key={category.slug} className="chip-button border-white/10 bg-[rgba(255,255,255,0.12)] text-white text-xs">
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
              <div className="flex gap-3 overflow-x-auto pb-2" aria-label={dictionary.home.categoryLabel}>
                {serviceCategories.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/${locale}/providers?category=${category.slug}`}
                    className="chip-button border-white/10 bg-[rgba(8,23,69,0.34)] text-white shadow-[0_10px_24px_rgba(8,18,37,0.18)] text-sm"
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
        <article className="surface-card rounded-[2rem] bg-[linear-gradient(135deg,rgba(13,28,69,0.98),rgba(20,92,255,0.92)_72%,rgba(96,165,250,0.8))] p-6 text-white shadow-[0_26px_60px_rgba(12,40,104,0.18)] sm:p-7">
          <div className="text-sm font-semibold uppercase tracking-[0.14em] text-white/72">{dictionary.nav.safety}</div>
          <h2 className={`mt-3 text-2xl font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{dictionary.home.safetyTitle}</h2>
          <p className="mt-4 max-w-2xl text-sm leading-8 text-white/82">{dictionary.home.safetyDescription}</p>
          <div className="mt-5 grid gap-3">
            {[
              locale === "ar" ? "الإبلاغ عن التحرش أو التواصل غير المناسب" : "Signaler un harcèlement ou un contact inapproprié",
              locale === "ar" ? "حماية الخصوصية للأنشطة المنزلية الحساسة" : "Mieux protéger les activités à domicile sensibles",
              locale === "ar" ? "فتح طلب دعم مع متابعة واضحة داخل لوحة الإدارة" : "Ouvrir un ticket avec suivi clair côté admin",
            ].map((item) => (
              <div key={item} className="rounded-[1.25rem] border border-white/12 bg-white/10 px-4 py-3 text-sm leading-7 text-white/84">
                {item}
              </div>
            ))}
          </div>
          <Link href={`/${locale}/safety`} className="button-secondary mt-6 border-white/18 bg-white/10 text-white shadow-[0_18px_36px_rgba(8,18,37,0.18)]">
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
              return (
                <div key={provider.id} className="rounded-[1.5rem] border border-[rgba(15,95,255,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(231,240,255,0.9))] p-5 shadow-[0_18px_40px_rgba(15,95,255,0.08)]">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="status-pill status-pill--verified">{provider.isVerified ? dictionary.common.verified : dictionary.common.featured}</span>
                    <span className="chip-button min-h-0 px-3 py-2 text-xs">
                      {provider.profileType === "home_business" ? dictionary.nav.businesses : dictionary.nav.providers}
                    </span>
                    <span className="chip-button min-h-0 px-3 py-2 text-xs">{stageLabels[stage]}</span>
                  </div>
                  <h3 className={`mt-3 text-xl font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{provider.displayName}</h3>
                  <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{getLocalizedValue(provider.shortTagline, locale)}</p>
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
              {locale === "ar" ? "هنيني يساعدك تكبر من أول طلب إلى فرص أكبر" : "Henini aide à grandir du premier client vers de meilleures opportunités"}
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
