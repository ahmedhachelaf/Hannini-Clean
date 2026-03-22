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
  };
};

export function ProvidersFilters({ locale, actionPath, categories, zones, values, labels }: ProvidersFiltersProps) {
  const defaultProvince =
    values.province ??
    zones.find((zone) => zone.slug === values.zone)?.provinceSlug ??
    "";
  const [province, setProvince] = useState(defaultProvince);

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
    () => zones.filter((zone) => !province || zone.provinceSlug === province),
    [province, zones],
  );

  return (
    <form
      action={actionPath}
      role="search"
      aria-label={locale === "ar" ? "تصفية والبحث عن المزودين" : "Filtrer et rechercher des prestataires"}
      className="surface-card flex flex-col gap-4 rounded-[1.75rem] bg-[linear-gradient(135deg,rgba(8,23,69,0.98),rgba(14,67,191,0.94)_62%,rgba(48,114,255,0.88))] p-5 text-white shadow-[0_28px_60px_rgba(8,34,99,0.24)] lg:flex-row lg:flex-wrap lg:items-end"
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
          onChange={(event) => setProvince(event.target.value)}
          className="input-base"
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
        <select name="zone" defaultValue={values.zone ?? ""} className="input-base">
          <option value="">{locale === "ar" ? "كل المدن والمناطق" : "Toutes les villes et zones"}</option>
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
          <option value="rating">{labels.sortRating}</option>
          <option value="response">{labels.sortResponse}</option>
          <option value="jobs">{labels.sortJobs}</option>
        </select>
      </label>

      <div className="flex flex-wrap gap-3 sm:flex-nowrap">
        <button type="submit" className="button-primary w-full sm:w-auto">
          {locale === "ar" ? "تطبيق" : "Appliquer"}
        </button>
        <a href={actionPath} className="button-secondary w-full sm:w-auto">
          {labels.reset}
        </a>
      </div>
    </form>
  );
}
