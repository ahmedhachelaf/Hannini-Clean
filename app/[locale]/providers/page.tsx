import { ProvidersExplorer } from "@/components/providers/providers-explorer";
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
    profileType: "service_provider" as const,
    query: readSearchValue(query.q),
    category: readSearchValue(query.category),
    province: readSearchValue(query.province),
    zone: readSearchValue(query.zone),
    sort: (readSearchValue(query.sort) as SortOption | undefined) ?? "top",
  };

  const [categories, zones, providers] = await Promise.all([
    getCategories(),
    getZones(),
    getProviders(filters),
  ]);
  const serviceCategories = categories.filter((category) => category.lane === "service_provider");

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <ProvidersExplorer
        locale={locale}
        actionPath={`/${locale}/providers`}
        categories={serviceCategories}
        zones={zones}
        providers={providers}
        values={filters}
        labels={dictionary.listing}
      />
    </div>
  );
}
