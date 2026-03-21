"use client";

import { useMemo, useRef, useState } from "react";
import { ProviderCard } from "@/components/providers/provider-card";
import { ProvidersFilters } from "@/components/providers/providers-filters";
import { getLocalizedValue } from "@/lib/i18n";
import type { Category, Locale, Provider, SortOption, Zone } from "@/lib/types";

type ProvidersExplorerProps = {
  locale: Locale;
  actionPath: string;
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

function getPaddedBounds(items: Provider[]) {
  const bounds = getBounds(items);
  const latPadding = Math.max((bounds.maxLat - bounds.minLat) * 0.28, 0.12);
  const lngPadding = Math.max((bounds.maxLng - bounds.minLng) * 0.28, 0.12);

  return {
    minLat: bounds.minLat - latPadding,
    maxLat: bounds.maxLat + latPadding,
    minLng: bounds.minLng - lngPadding,
    maxLng: bounds.maxLng + lngPadding,
  };
}

export function ProvidersExplorer({ locale, actionPath, categories, zones, providers, values, labels }: ProvidersExplorerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(providers[0]?.id ?? null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const zoneMap = useMemo(() => new Map(zones.map((zone) => [zone.slug, zone])), [zones]);
  const categoryMap = useMemo(() => new Map(categories.map((category) => [category.slug, category])), [categories]);
  const provinceMap = useMemo(
    () => new Map(zones.map((zone) => [zone.provinceSlug, zone.provinceName])),
    [zones],
  );
  const bounds = useMemo(() => (providers.length > 0 ? getPaddedBounds(providers) : null), [providers]);
  const selectedProvider = providers.find((provider) => provider.id === selectedId) ?? providers[0] ?? null;
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

  const mapFrameSrc = useMemo(() => {
    if (!bounds) {
      return "https://www.openstreetmap.org/export/embed.html?bbox=-1%2C34%2C5%2C37&layer=mapnik";
    }

    const bbox = [
      bounds.minLng.toFixed(4),
      bounds.minLat.toFixed(4),
      bounds.maxLng.toFixed(4),
      bounds.maxLat.toFixed(4),
    ].join(",");
    const marker = selectedProvider
      ? `&marker=${selectedProvider.coordinates.latitude.toFixed(4)}%2C${selectedProvider.coordinates.longitude.toFixed(4)}`
      : "";

    return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik${marker}`;
  }, [bounds, selectedProvider]);

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

      <ProvidersFilters locale={locale} actionPath={actionPath} categories={categories} zones={zones} values={values} labels={labels} />

      {providers.length === 0 ? (
        <section className="surface-card rounded-[1.75rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(236,244,255,0.9))] p-10 text-center">
          <h2 className={`text-2xl font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{labels.emptyTitle}</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{labels.emptyDescription}</p>
        </section>
      ) : (
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-start">
          <div className="map-panel sticky top-28 overflow-hidden rounded-[2rem] shadow-[0_30px_70px_rgba(12,40,104,0.14)]">
            <div className="relative min-h-[520px] overflow-hidden bg-[linear-gradient(180deg,rgba(13,28,69,0.98),rgba(20,92,255,0.9)_75%,rgba(147,197,253,0.78))] p-6 text-white">
              <iframe
                title={locale === "ar" ? "خريطة النتائج" : "Carte des résultats"}
                src={mapFrameSrc}
                className="pointer-events-none absolute inset-0 h-full w-full border-0 opacity-92"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,23,56,0.12),rgba(9,23,56,0.34)_100%)]" />

              <div className="absolute inset-x-6 top-6 z-10 rounded-[1.5rem] border border-white/14 bg-white/10 p-4 backdrop-blur">
                <div className="text-sm font-semibold text-white/76">{locale === "ar" ? "خريطة المزودين" : "Carte des prestataires"}</div>
                <div className="mt-1 text-lg font-extrabold">{locale === "ar" ? "نتائج حسب الولاية والفئة" : "Resultats par wilaya et categorie"}</div>
                <div className="mt-2 text-xs text-white/72">
                  {locale === "ar" ? "الولاية الحالية:" : "Wilaya active :"} {activeProvinceName}
                </div>
                {selectedProvider ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-white/86">
                    <span className="rounded-full border border-white/14 bg-[rgba(8,18,37,0.18)] px-3 py-1.5">
                      {selectedProvider.displayName}
                    </span>
                    <span className="rounded-full border border-white/14 bg-[rgba(8,18,37,0.18)] px-3 py-1.5">
                      {getLocalizedValue(zoneMap.get(selectedProvider.zones[0])?.name ?? { ar: "غير محدد", fr: "Non defini" }, locale)}
                    </span>
                  </div>
                ) : null}
              </div>

              <div className="absolute inset-0 z-10 mt-24">
                <div className="absolute inset-[10%] rounded-[2rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0.02))]">
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
                            ? "z-20 border-white bg-white text-[var(--navy)] ring-4 ring-white/20"
                            : "z-10 border-white/18 bg-[rgba(13,28,69,0.78)] text-white backdrop-blur hover:bg-[rgba(13,28,69,0.88)]"
                        }`}
                        style={{ top: `${position.top}%`, left: `${position.left}%` }}
                      >
                        {getLocalizedValue(zoneMap.get(provider.zones[0])?.name ?? { ar: "غير محدد", fr: "Non defini" }, locale)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="absolute inset-x-6 bottom-6 z-10 rounded-[1.35rem] border border-white/14 bg-[rgba(8,18,37,0.26)] p-4 backdrop-blur">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-white/84">
                    {locale === "ar" ? "اضغط على البطاقة أو الدبوس لمزامنة الخريطة" : "Cliquez sur la carte ou un repère pour synchroniser la sélection"}
                  </div>
                  {selectedProvider ? (
                    <a
                      href={selectedProvider.googleMapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="button-secondary border-white/16 bg-white/12 text-white"
                    >
                      {locale === "ar" ? "افتح في الخرائط" : "Ouvrir dans Maps"}
                    </a>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="grid gap-3 border-t border-[rgba(20,92,255,0.12)] bg-white/92 p-5">
              {providers.slice(0, 4).map((provider) => (
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
