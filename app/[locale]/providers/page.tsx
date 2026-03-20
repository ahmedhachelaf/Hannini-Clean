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
      <section className="space-y-4">
        <h1 className={`section-title font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{dictionary.listing.title}</h1>
        <p className="max-w-2xl text-sm leading-7 text-[var(--muted)]">{dictionary.listing.description}</p>
      </section>

      <ProvidersFilters
        locale={locale}
        categories={categories}
        zones={zones}
        values={filters}
        labels={dictionary.listing}
      />

      {providers.length === 0 ? (
        <section className="surface-card rounded-[1.75rem] p-10 text-center">
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
