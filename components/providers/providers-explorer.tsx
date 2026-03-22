"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

function getMarkerLabel(zone: Zone | undefined, locale: Locale) {
  const fallback = locale === "ar" ? "غير محدد" : "Non defini";
  const label = getLocalizedValue(zone?.name ?? { ar: fallback, fr: fallback }, locale);
  return label.length > 18 ? `${label.slice(0, 18)}…` : label;
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

  useEffect(() => {
    if (!providers.some((provider) => provider.id === selectedId)) {
      setSelectedId(providers[0]?.id ?? null);
    }
  }, [providers, selectedId]);

  function getMarkerPosition(provider: Provider, index: number) {
    if (!bounds) {
      return { top: 50, left: 50 };
    }

    const latSpan = Math.max(bounds.maxLat - bounds.minLat, 0.1);
    const lngSpan = Math.max(bounds.maxLng - bounds.minLng, 0.1);

    const duplicateIndex = providers
      .slice(0, index)
      .filter(
        (item) =>
          item.coordinates.latitude === provider.coordinates.latitude &&
          item.coordinates.longitude === provider.coordinates.longitude,
      ).length;
    const duplicateOffset = duplicateIndex * 2.6;

    return {
      top: Math.min(86, 16 + ((bounds.maxLat - provider.coordinates.latitude) / latSpan) * 68 + duplicateOffset),
      left: Math.min(84, 16 + ((provider.coordinates.longitude - bounds.minLng) / lngSpan) * 68 + duplicateOffset),
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
      <section className="surface-card gradient-frame rounded-[2rem] bg-[linear-gradient(135deg,rgba(255,255,255,0.99),rgba(226,238,255,0.96)_58%,rgba(205,224,255,0.92))] p-6 text-[var(--ink)] shadow-[0_30px_70px_rgba(12,40,104,0.2)] sm:p-8">
        <h1 className={`section-title font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{labels.title}</h1>
        <p className="max-w-2xl text-sm leading-7 text-[var(--ink)]">{labels.description}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <span className="status-pill border border-[rgba(15,95,255,0.12)] bg-white text-[var(--ink)]">
            {locale === "ar" ? `${providers.length} مزود ظاهر` : `${providers.length} prestataires visibles`}
          </span>
          <span className="status-pill border border-[rgba(15,95,255,0.12)] bg-white text-[var(--ink)]">
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
          <div className="map-panel overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_56px_rgba(12,40,104,0.12)] xl:sticky xl:top-28">
            <div className="border-b border-[rgba(20,92,255,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(236,244,255,0.96))] p-4 text-[var(--ink)] sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-[var(--muted)]">
                    {locale === "ar" ? "خريطة المزودين" : "Carte des prestataires"}
                  </div>
                  <div className="mt-1 text-base font-extrabold">
                    {locale === "ar" ? "النتائج حسب الولاية والفئة" : "Résultats par wilaya et catégorie"}
                  </div>
                </div>
                <span className="status-pill border border-[rgba(20,92,255,0.12)] bg-[var(--soft)] text-[var(--ink)]">
                  {activeProvinceName}
                </span>
              </div>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                {locale === "ar"
                  ? "المؤشرات مبنية على مراكز مناطق تقريبية لشرح الانتشار، وليس على عناوين منزلية دقيقة."
                  : "Les repères s'appuient sur des centres de zones approximatifs pour montrer la couverture, pas des adresses personnelles précises."}
              </p>
            </div>

            <div className="relative min-h-[420px] overflow-hidden bg-[linear-gradient(180deg,rgba(226,236,255,0.9),rgba(248,251,255,0.98))] sm:min-h-[500px]">
              <iframe
                title={locale === "ar" ? "خريطة النتائج" : "Carte des résultats"}
                src={mapFrameSrc}
                className="pointer-events-none absolute inset-0 h-full w-full border-0 opacity-100 saturate-[0.92]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="absolute inset-0 z-10">
                <div className="absolute inset-0">
                  {providers.map((provider, index) => {
                    const position = getMarkerPosition(provider, index);
                    const selected = provider.id === selectedId;
                    const zone = zoneMap.get(provider.zones[0]);
                    return (
                      <button
                        key={provider.id}
                        type="button"
                        onClick={() => selectProvider(provider.id)}
                        aria-pressed={selected}
                        aria-label={
                          locale === "ar"
                            ? `تحديد ${provider.displayName} في ${getLocalizedValue(zone?.name ?? { ar: "غير محدد", fr: "Non defini" }, locale)}`
                            : `Selectionner ${provider.displayName} a ${getLocalizedValue(zone?.name ?? { ar: "غير محدد", fr: "Non defini" }, locale)}`
                        }
                        className={`absolute -translate-x-1/2 -translate-y-1/2 transition ${
                          selected
                            ? "z-20"
                            : "z-10"
                        }`}
                        style={{ top: `${position.top}%`, left: `${position.left}%` }}
                      >
                        <span
                          className={`flex h-11 w-11 items-center justify-center rounded-full border text-sm font-extrabold shadow-[0_12px_24px_rgba(8,18,37,0.18)] ${
                            selected
                              ? "border-[var(--navy)] bg-[var(--navy)] text-white ring-4 ring-[rgba(20,92,255,0.18)]"
                              : "border-white bg-white text-[var(--navy)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                          }`}
                        >
                          {index + 1}
                        </span>
                        {selected ? (
                          <span className="mt-2 block rounded-full border border-[rgba(20,92,255,0.12)] bg-white px-3 py-1 text-[11px] font-bold whitespace-nowrap text-[var(--navy)] shadow-[0_10px_24px_rgba(12,40,104,0.12)]">
                            {getMarkerLabel(zone, locale)}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid gap-3 border-t border-[rgba(20,92,255,0.12)] bg-white/96 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.15rem] border border-[rgba(20,92,255,0.12)] bg-[var(--soft)] px-4 py-3 text-sm text-[var(--ink)]">
                <div className="font-semibold">
                  {locale === "ar" ? "اضغط على البطاقة أو المؤشر لمزامنة الخريطة" : "Cliquez sur une carte ou un repère pour synchroniser la sélection"}
                </div>
                {selectedProvider ? (
                  <a
                    href={selectedProvider.googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="button-secondary min-h-11 px-4"
                  >
                    {locale === "ar" ? "افتح في الخرائط" : "Ouvrir dans Maps"}
                  </a>
                ) : null}
              </div>
              {providers.slice(0, 5).map((provider, index) => (
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
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${
                        provider.id === selectedId ? "bg-[var(--accent)] text-white" : "bg-[var(--soft)] text-[var(--navy)]"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <div className="text-sm font-bold text-[var(--ink)]">{provider.displayName}</div>
                  </div>
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
