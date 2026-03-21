import { ProviderCard } from "@/components/providers/provider-card";
import { ProvidersFilters } from "@/components/providers/providers-filters";
import { getDictionary, isLocale } from "@/lib/i18n";
import { getCategories, getProviders, getZones } from "@/lib/repository";
import type { SortOption } from "@/lib/types";
import { notFound } from "next/navigation";

type ProvidersPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readSearchValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ProvidersPage({ params, searchParams }: ProvidersPageProps) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const filters = {
    query: readSearchValue(query.q),
    category: readSearchValue(query.category),
    zone: readSearchValue(query.zone),
    sort: (readSearchValue(query.sort) as SortOption | undefined) ?? "top",
  };

  const [categories, zones, providers] = await Promise.all([
    getCategories(),
    getZones(),
    getProviders(filters),
  ]);

  const categoryMap = new Map(categories.map((category) => [category.slug, category]));
  const zoneMap = new Map(zones.map((zone) => [zone.slug, zone]));

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <section className="surface-card gradient-frame rounded-[2rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(236,244,255,0.92))] p-6 sm:p-8">
        <h1 className={`section-title font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{dictionary.listing.title}</h1>
        <p className="max-w-2xl text-sm leading-7 text-[var(--muted)]">{dictionary.listing.description}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <span className="status-pill border border-[rgba(15,95,255,0.12)] bg-white text-[var(--ink)]">
            {locale === "ar" ? `${providers.length} مزود ظاهر` : `${providers.length} prestataires visibles`}
          </span>
          <span className="status-pill border border-[rgba(15,95,255,0.12)] bg-white text-[var(--ink)]">
            {locale === "ar" ? "ترتيب يعتمد على الثقة والاستجابة" : "Classement par confiance et réactivité"}
          </span>
        </div>
      </section>

      <ProvidersFilters
        locale={locale}
        categories={categories}
        zones={zones}
        values={filters}
        labels={dictionary.listing}
      />

      {providers.length === 0 ? (
        <section className="surface-card rounded-[1.75rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(236,244,255,0.9))] p-10 text-center">
          <h2 className={`text-2xl font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{dictionary.listing.emptyTitle}</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{dictionary.listing.emptyDescription}</p>
        </section>
      ) : (
        <section className="grid gap-5 lg:grid-cols-2">
          {providers.map((provider) => (
            <ProviderCard
              key={provider.id}
              locale={locale}
              provider={provider}
              category={categoryMap.get(provider.categorySlug) ?? null}
              zones={provider.zones
                .map((slug) => zoneMap.get(slug))
                .filter((zone): zone is NonNullable<typeof zone> => Boolean(zone))}
            />
          ))}
        </section>
      )}
    </div>
  );
}
