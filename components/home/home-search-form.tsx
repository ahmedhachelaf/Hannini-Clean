"use client";

import { useMemo, useState } from "react";
import { getLocalizedValue } from "@/lib/i18n";
import type { Locale, Zone } from "@/lib/types";

type HomeSearchFormProps = {
  locale: Locale;
  zones: Zone[];
  labels: {
    search: string;
    searchPlaceholder: string;
    provinceLabel: string;
    zoneLabel: string;
  };
};

export function HomeSearchForm({ locale, zones, labels }: HomeSearchFormProps) {
  const [province, setProvince] = useState("");

  const provinces = useMemo(
    () =>
      Array.from(new Map(zones.map((zone) => [zone.provinceSlug, zone.provinceName])).entries()).map(
        ([slug, name]) => ({ slug, name }),
      ),
    [zones],
  );

  const filteredZones = useMemo(
    () => zones.filter((zone) => !province || zone.provinceSlug === province),
    [province, zones],
  );

  return (
    <form
      action={`/${locale}/providers`}
      role="search"
      aria-label={locale === "ar" ? "البحث عن مزود خدمة" : "Recherche de prestataires"}
      className="mt-8 grid gap-3 rounded-[1.75rem] border border-white/16 bg-[rgba(255,255,255,0.12)] p-4 shadow-[0_28px_60px_rgba(8,18,37,0.2)] backdrop-blur-xl sm:grid-cols-[minmax(0,1fr)_210px_210px_auto]"
    >
      <input
        name="q"
        type="search"
        className="input-base"
        placeholder={labels.searchPlaceholder}
        aria-label={labels.searchPlaceholder}
      />

      <select
        name="province"
        value={province}
        onChange={(event) => setProvince(event.target.value)}
        className="input-base"
        aria-label={labels.provinceLabel}
      >
        <option value="">{labels.provinceLabel}</option>
        {provinces.map((item) => (
          <option key={item.slug} value={item.slug}>
            {getLocalizedValue(item.name, locale)}
          </option>
        ))}
      </select>

      <select name="zone" className="input-base" aria-label={labels.zoneLabel}>
        <option value="">{labels.zoneLabel}</option>
        {filteredZones.map((zone) => (
          <option key={zone.slug} value={zone.slug}>
            {getLocalizedValue(zone.name, locale)}
          </option>
        ))}
      </select>

      <button type="submit" className="button-primary w-full sm:w-auto">
        {labels.search}
      </button>
    </form>
  );
}
