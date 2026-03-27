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
  const [provinceQuery, setProvinceQuery] = useState("");
  const [zoneQuery, setZoneQuery] = useState("");

  const provinces = useMemo(
    () =>
      Array.from(new Map(zones.map((zone) => [zone.provinceSlug, zone.provinceName])).entries()).map(
        ([slug, name]) => ({ slug, name }),
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

  const filteredProvinces = useMemo(
    () =>
      provinces.filter((item) => {
        if (!provinceQuery.trim()) return true;
        const name = getLocalizedValue(item.name, locale).toLowerCase();
        return name.includes(provinceQuery.trim().toLowerCase());
      }),
    [provinces, provinceQuery, locale],
  );

  return (
    <form
      action={`/${locale}/providers`}
      role="search"
      aria-label={locale === "ar" ? "البحث عن مزود خدمة" : "Recherche de prestataires"}
      className="mt-8 grid gap-3 rounded-[1.75rem] border border-white/10 bg-[rgba(8,23,69,0.34)] p-4 shadow-[0_28px_60px_rgba(8,18,37,0.24)] backdrop-blur-xl sm:grid-cols-[minmax(0,1fr)_210px_210px_auto]"
    >
      <input
        name="q"
        type="search"
        className="input-base"
        placeholder={labels.searchPlaceholder}
        aria-label={labels.searchPlaceholder}
      />

      <div className="grid gap-2">
        <input
          type="search"
          value={provinceQuery}
          onChange={(event) => setProvinceQuery(event.target.value)}
          placeholder={locale === "ar" ? "ابحث عن ولاية" : "Chercher une wilaya"}
          className="input-base min-w-0 text-sm sm:text-base"
          aria-label={labels.provinceLabel}
        />
        <select
          name="province"
          value={province}
          onChange={(event) => {
            setProvince(event.target.value);
            setZoneQuery("");
          }}
          className="input-base min-w-0 text-sm sm:text-base"
          aria-label={labels.provinceLabel}
        >
          <option value="">{labels.provinceLabel}</option>
          {filteredProvinces.map((item) => (
            <option key={item.slug} value={item.slug}>
              {getLocalizedValue(item.name, locale)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2">
        <input
          type="search"
          value={zoneQuery}
          onChange={(event) => setZoneQuery(event.target.value)}
          placeholder={locale === "ar" ? "ابحث عن مدينة" : "Chercher une ville"}
          className="input-base min-w-0 text-sm sm:text-base"
          aria-label={labels.zoneLabel}
          disabled={!province}
        />
        <select name="zone" className="input-base min-w-0 text-sm sm:text-base" aria-label={labels.zoneLabel} disabled={!province}>
          <option value="">{province ? labels.zoneLabel : locale === "ar" ? "اختر الولاية أولاً" : "Choisissez d'abord la wilaya"}</option>
          {filteredZones.map((zone) => (
            <option key={zone.slug} value={zone.slug}>
              {getLocalizedValue(zone.name, locale)}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" className="button-primary w-full sm:w-auto">
        {labels.search}
      </button>
    </form>
  );
}
