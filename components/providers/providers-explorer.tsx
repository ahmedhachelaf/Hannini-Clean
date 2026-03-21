"use client";

import { useMemo, useRef, useState } from "react";
import { ProviderCard } from "@/components/providers/provider-card";
import { ProvidersFilters } from "@/components/providers/providers-filters";
import { getLocalizedValue } from "@/lib/i18n";
import type { Category, Locale, Provider, SortOption, Zone } from "@/lib/types";

type ProvidersExplorerProps = {
  locale: Locale;
  categories: Category[];
  zones: Zone[];
  providers: Provider[];
  values: {
    query?: string;
    category?: string;
    province?: string;
    zone?: string;
    sort?: SortOption;
  };
  labels: {
    searchLabel: string;
    categoryLabel: string;
    provinceLabel: string;
    zoneLabel: string;
    sortLabel: string;
    sortTop: string;
    sortRating: string;
    sortResponse: string;
    sortJobs: string;
    reset: string;
    title: string;
    description: string;
    emptyTitle: string;
    emptyDescription: string;
  };
};

function getBounds(items: Provider[]) {
  const latitudes = items.map((item) => item.coordinates.latitude);
  const longitudes = items.map((item) => item.coordinates.longitude);

  return {
    minLat: Math.min(...latitudes),
    maxLat: Math.max(...latitudes),
    minLng: Math.min(...longitudes),
    maxLng: Math.max(...longitudes),
  };
}

export function ProvidersExplorer({ locale, categories, zones, providers, values, labels }: ProvidersExplorerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(providers[0]?.id ?? null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const zoneMap = useMemo(() => new Map(zones.map((zone) => [zone.slug, zone])), [zones]);
  const categoryMap = useMemo(() => new Map(categories.map((category) => [category.slug, category])), [categories]);
  const provinceMap = useMemo(
    () => new Map(zones.map((zone) => [zone.provinceSlug, zone.provinceName])),
    [zones],
  );
  const bounds = useMemo(() => (providers.length > 0 ? getBounds(providers) : null), [providers]);
  const activeProvinceName = values.province
    ? getLocalizedValue(provinceMap.get(values.province) ?? { ar: "غير محدد", fr: "Non defini" }, locale)
    : locale === "ar"
      ? "كل الولايات"
      : "Toutes les wilayas";

  function getMarkerPosition(provider: Provider) {
    if (!bounds) {
      return { top: 50, left: 50 };
    }

    const latSpan = Math.max(bounds.maxLat - bounds.minLat, 0.1);
    const lngSpan = Math.max(bounds.maxLng - bounds.minLng, 0.1);

    return {
      top: 16 + ((bounds.maxLat - provider.coordinates.latitude) / latSpan) * 68,
      left: 16 + ((provider.coordinates.longitude - bounds.minLng) / lngSpan) * 68,
    };
  }

  function selectProvider(providerId: string) {
    setSelectedId(providerId);
    cardRefs.current[providerId]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  return (
    <>
      <section className="surface-card gradient-frame rounded-[2rem] bg-[linear-gradient(135deg,rgba(13,28,69,0.98),rgba(20,92,255,0.92)_70%,rgba(96,165,250,0.84))] p-6 text-white shadow-[0_30px_70px_rgba(12,40,104,0.2)] sm:p-8">
        <h1 className={`section-title font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{labels.title}</h1>
        <p className="max-w-2xl text-sm leading-7 text-white/82">{labels.description}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <span className="status-pill border border-white/16 bg-white/10 text-white">
            {locale === "ar" ? `${providers.length} مزود ظاهر` : `${providers.length} prestataires visibles`}
          </span>
          <span className="status-pill border border-white/16 bg-white/10 text-white">
            {locale === "ar" ? "خريطة وقائمة مترابطتان" : "Carte et liste synchronisees"}
          </span>
        </div>
      </section>

      <ProvidersFilters locale={locale} categories={categories} zones={zones} values={values} labels={labels} />

      {providers.length === 0 ? (
        <section className="surface-card rounded-[1.75rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(236,244,255,0.9))] p-10 text-center">
          <h2 className={`text-2xl font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{labels.emptyTitle}</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{labels.emptyDescription}</p>
        </section>
      ) : (
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-start">
          <div className="map-panel sticky top-28 overflow-hidden rounded-[2rem] shadow-[0_30px_70px_rgba(12,40,104,0.14)]">
            <div className="relative min-h-[480px] bg-[linear-gradient(180deg,rgba(13,28,69,0.96),rgba(20,92,255,0.88)_65%,rgba(147,197,253,0.78))] p-6 text-white">
              <div className="absolute inset-x-6 top-6 rounded-[1.5rem] border border-white/14 bg-white/10 p-4 backdrop-blur">
                <div className="text-sm font-semibold text-white/76">{locale === "ar" ? "خريطة المزودين" : "Carte des prestataires"}</div>
                <div className="mt-1 text-lg font-extrabold">{locale === "ar" ? "نتائج حسب الولاية والفئة" : "Resultats par wilaya et categorie"}</div>
                <div className="mt-2 text-xs text-white/72">
                  {locale === "ar" ? "الولاية الحالية:" : "Wilaya active :"} {activeProvinceName}
                </div>
              </div>

              <div className="absolute inset-0 mt-24">
                <div className="absolute left-[14%] top-[54%] h-28 w-28 rounded-full bg-white/8 blur-3xl" />
                <div className="absolute left-[48%] top-[34%] h-32 w-32 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute right-[12%] top-[48%] h-28 w-28 rounded-full bg-white/8 blur-3xl" />

                <div className="absolute inset-[10%] rounded-[2rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))]">
                  {providers.map((provider) => {
                    const position = getMarkerPosition(provider);
                    const selected = provider.id === selectedId;
                    return (
                      <button
                        key={provider.id}
                        type="button"
                        onClick={() => selectProvider(provider.id)}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border px-3 py-2 text-xs font-bold shadow-[0_12px_28px_rgba(8,18,37,0.22)] transition ${
                          selected
                            ? "z-20 border-white bg-white text-[var(--navy)]"
                            : "z-10 border-white/18 bg-[rgba(13,28,69,0.72)] text-white backdrop-blur"
                        }`}
                        style={{ top: `${position.top}%`, left: `${position.left}%` }}
                      >
                        {getLocalizedValue(zoneMap.get(provider.zones[0])?.name ?? { ar: "غير محدد", fr: "Non defini" }, locale)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid gap-3 border-t border-[rgba(20,92,255,0.12)] bg-white/92 p-5">
              {providers.slice(0, 3).map((provider) => (
                <button
                  key={provider.id}
                  type="button"
                  onClick={() => selectProvider(provider.id)}
                  className={`rounded-[1.25rem] border px-4 py-3 text-start transition ${
                    provider.id === selectedId
                      ? "border-[rgba(20,92,255,0.32)] bg-[var(--accent-soft)] shadow-[0_14px_28px_rgba(20,92,255,0.12)]"
                      : "border-[rgba(20,92,255,0.12)] bg-white hover:border-[rgba(20,92,255,0.2)]"
                  }`}
                >
                  <div className="text-sm font-bold text-[var(--ink)]">{provider.displayName}</div>
                  <div className="mt-1 text-xs text-[var(--muted)]">
                    {categoryMap.get(provider.categorySlug)?.name[locale]} • {getLocalizedValue(zoneMap.get(provider.zones[0])?.provinceName ?? { ar: "غير محدد", fr: "Non defini" }, locale)} • {getLocalizedValue(zoneMap.get(provider.zones[0])?.name ?? { ar: "غير محدد", fr: "Non defini" }, locale)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-5">
            {providers.map((provider) => (
              <div
                key={provider.id}
                ref={(node) => {
                  cardRefs.current[provider.id] = node;
                }}
                onClick={() => setSelectedId(provider.id)}
              >
                <ProviderCard
                  locale={locale}
                  provider={provider}
                  category={categoryMap.get(provider.categorySlug) ?? null}
                  zones={provider.zones
                    .map((slug) => zoneMap.get(slug))
                    .filter((zone): zone is Zone => Boolean(zone))}
                  highlighted={provider.id === selectedId}
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
