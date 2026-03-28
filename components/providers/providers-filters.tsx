"use client";

import { useMemo, useState } from "react";
import { getLocalizedValue } from "@/lib/i18n";
import type { Category, Locale, SortOption, Zone } from "@/lib/types";

type ProvidersFiltersProps = {
  locale: Locale;
  actionPath: string;
  categories: Category[];
  zones: Zone[];
  values: {
    query?: string;
    category?: string;
    province?: string;
    zone?: string;
    womenSafe?: boolean;
    verifiedOnly?: boolean;
    sort?: SortOption;
  };
  labels: {
    searchLabel: string;
    categoryLabel: string;
    provinceLabel: string;
    zoneLabel: string;
    womenSafeLabel: string;
    verifiedOnlyLabel: string;
    sortLabel: string;
    sortTop: string;
    sortNearest: string;
    sortRating: string;
    sortResponse: string;
    sortJobs: string;
    reset: string;
    categoryBrowseLabel: string;
  };
};

export function ProvidersFilters({ locale, actionPath, categories, zones, values, labels }: ProvidersFiltersProps) {
  const defaultProvince =
    values.province ??
    zones.find((zone) => zone.slug === values.zone)?.provinceSlug ??
    "";
  const [province, setProvince] = useState(defaultProvince);
  const [zoneQuery, setZoneQuery] = useState("");

  const provinces = useMemo(
    () =>
      Array.from(new Map(zones.map((zone) => [zone.provinceSlug, zone.provinceName])).entries()).map(
        ([slug, name]) => ({
          slug,
          name,
        }),
      ),
    [zones],
  );

  const filteredZones = useMemo(
    () =>
      zones.filter((zone) => {
        if (!province) return false;
        if (zone.provinceSlug !== province) return false;
        if (!zoneQuery.trim()) return true;
        const name = getLocalizedValue(zone.name, locale).toLowerCase();
        return name.includes(zoneQuery.trim().toLowerCase());
      }),
    [province, zones, zoneQuery, locale],
  );
  const featuredCategories = categories.slice(0, 8);

  return (
    <form
      action={actionPath}
      role="search"
      aria-label={locale === "ar" ? "تصفية والبحث عن المزودين" : "Filtrer et rechercher des prestataires"}
      className="surface-card flex flex-col gap-4 rounded-[1.75rem] bg-[linear-gradient(135deg,rgba(18,42,38,0.98),rgba(34,81,73,0.95)_58%,rgba(203,107,68,0.86))] p-5 text-white shadow-[0_28px_60px_rgba(24,40,36,0.24)] lg:flex-row lg:flex-wrap lg:items-end"
    >
      <label className="min-w-0 flex-1">
        <span className="mb-2 block text-[0.98rem] font-semibold text-white/90">{labels.searchLabel}</span>
        <input
          type="search"
          name="q"
          defaultValue={values.query}
          className="input-base"
          placeholder={locale === "ar" ? "مثال: كهربائي أو كريم" : "Ex: électricien ou Karim"}
        />
      </label>

      <label className="lg:w-56">
        <span className="mb-2 block text-[0.98rem] font-semibold text-white/90">{labels.categoryLabel}</span>
        <select name="category" defaultValue={values.category ?? ""} className="input-base">
          <option value="">{locale === "ar" ? "كل الفئات" : "Toutes les catégories"}</option>
          {categories.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.name[locale]}
            </option>
          ))}
        </select>
      </label>

      <label className="lg:w-52">
        <span className="mb-2 block text-[0.98rem] font-semibold text-white/90">{labels.provinceLabel}</span>
        <select
          name="province"
          value={province}
          onChange={(event) => {
            setProvince(event.target.value);
            setZoneQuery("");
          }}
          className="input-base min-w-0 text-sm sm:text-base"
        >
          <option value="">{locale === "ar" ? "كل الولايات" : "Toutes les wilayas"}</option>
          {provinces.map((item) => (
            <option key={item.slug} value={item.slug}>
              {getLocalizedValue(item.name, locale)}
            </option>
          ))}
        </select>
      </label>

      <label className="lg:w-56">
        <span className="mb-2 block text-[0.98rem] font-semibold text-white/90">{labels.zoneLabel}</span>
        <input
          type="search"
          value={zoneQuery}
          onChange={(event) => setZoneQuery(event.target.value)}
          placeholder={locale === "ar" ? "ابحث عن مدينة" : "Chercher une ville"}
          className="input-base mb-2 min-w-0 text-sm sm:text-base"
          disabled={!province}
        />
        <select name="zone" defaultValue={values.zone ?? ""} className="input-base min-w-0 text-sm sm:text-base" disabled={!province}>
          <option value="">
            {province
              ? locale === "ar"
                ? "كل المدن والمناطق"
                : "Toutes les villes et zones"
              : locale === "ar"
                ? "اختر الولاية أولاً"
                : "Choisissez d'abord la wilaya"}
          </option>
          {filteredZones.map((zone) => (
            <option key={zone.slug} value={zone.slug}>
              {getLocalizedValue(zone.name, locale)}
            </option>
          ))}
        </select>
      </label>

      <label className="lg:w-56">
        <span className="mb-2 block text-[0.98rem] font-semibold text-white/90">{labels.sortLabel}</span>
        <select name="sort" defaultValue={values.sort ?? "top"} className="input-base">
          <option value="top">{labels.sortTop}</option>
          <option value="nearest">{labels.sortNearest}</option>
          <option value="rating">{labels.sortRating}</option>
          <option value="response">{labels.sortResponse}</option>
          <option value="jobs">{labels.sortJobs}</option>
        </select>
      </label>

      <label className="flex min-h-11 items-center gap-3 rounded-[1.1rem] border border-white/16 bg-white/10 px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(24,40,36,0.16)] lg:w-auto">
        <input type="hidden" name="verifiedOnly" value="1" />
        <input
          type="checkbox"
          checked
          disabled
          readOnly
          className="h-4 w-4 rounded border-white/40 text-[var(--accent)] focus:ring-white/60"
        />
        <span>{labels.verifiedOnlyLabel}</span>
      </label>

      <label className="flex min-h-11 items-center gap-3 rounded-[1.1rem] border border-white/16 bg-white/10 px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(24,40,36,0.16)] lg:w-auto">
        <input
          type="checkbox"
          name="womenSafe"
          value="1"
          defaultChecked={Boolean(values.womenSafe)}
          className="h-4 w-4 rounded border-white/40 text-[var(--accent)] focus:ring-white/60"
        />
        <span>{labels.womenSafeLabel}</span>
      </label>

      <div className="flex flex-wrap gap-3">
        <button type="submit" className="button-primary w-full sm:w-auto">
          {locale === "ar" ? "تطبيق" : "Appliquer"}
        </button>
        <a href={actionPath} className="button-secondary w-full sm:w-auto">
          {labels.reset}
        </a>
      </div>

      <div className="w-full rounded-[1.25rem] border border-white/12 bg-[rgba(255,255,255,0.08)] p-3 backdrop-blur">
        <div className="mb-2 text-sm font-semibold text-white/90">{labels.categoryBrowseLabel}</div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <a
            href={actionPath}
            className={`chip-button min-h-0 shrink-0 px-3 py-2 text-xs ${!values.category ? "bg-[var(--soft)] text-[var(--navy)]" : "bg-white/10 text-white"}`}
          >
            {locale === "ar" ? "كل الفئات" : "Toutes"}
          </a>
          {featuredCategories.map((category) => {
            const params = new URLSearchParams();
            if (values.query) params.set("q", values.query);
            params.set("category", category.slug);
            if (values.province) params.set("province", values.province);
            if (values.zone) params.set("zone", values.zone);
            if (values.womenSafe) params.set("womenSafe", "1");
            params.set("verifiedOnly", "1");
            if (values.sort) params.set("sort", values.sort);

            return (
              <a
                key={category.slug}
                href={`${actionPath}?${params.toString()}`}
                className={`chip-button min-h-0 shrink-0 px-3 py-2 text-xs ${
                  values.category === category.slug ? "bg-[var(--soft)] text-[var(--navy)]" : "bg-white/10 text-white"
                }`}
              >
                {category.name[locale]}
              </a>
            );
          })}
        </div>
      </div>
    </form>
  );
}
