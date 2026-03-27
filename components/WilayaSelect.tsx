"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getCommunes, getWilayaByCode, getWilayas, searchWilayas } from "@/data/algeria-locations";
import type { Locale } from "@/lib/types";

type WilayaSelectProps = {
  locale?: Locale;
  onWilayaChange: (wilayaCode: string, name: string) => void;
  onCommuneChange: (commune: string) => void;
  required?: boolean;
  defaultWilaya?: string;
  defaultCommune?: string;
};

type DropdownState = "wilaya" | "commune" | null;

function useClickOutside(ref: React.RefObject<HTMLDivElement | null>, handler: () => void) {
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!ref.current) return;
      if (ref.current.contains(event.target as Node)) return;
      handler();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [handler, ref]);
}

export function WilayaSelect({
  locale = "ar",
  onWilayaChange,
  onCommuneChange,
  required = false,
  defaultWilaya,
  defaultCommune,
}: WilayaSelectProps) {
  const [activeDropdown, setActiveDropdown] = useState<DropdownState>(null);
  const [wilayaQuery, setWilayaQuery] = useState("");
  const [communeQuery, setCommuneQuery] = useState("");
  const [selectedWilaya, setSelectedWilaya] = useState(() => (defaultWilaya ? getWilayaByCode(defaultWilaya) : null));
  const [selectedCommune, setSelectedCommune] = useState(defaultCommune ?? "");
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useClickOutside(wrapperRef, () => setActiveDropdown(null));

  useEffect(() => {
    if (defaultWilaya) {
      const wilaya = getWilayaByCode(defaultWilaya);
      if (wilaya) {
        setSelectedWilaya(wilaya);
      }
    }
  }, [defaultWilaya]);

  useEffect(() => {
    if (defaultCommune) {
      setSelectedCommune(defaultCommune);
    }
  }, [defaultCommune]);

  const wilayas = useMemo(() => {
    if (!wilayaQuery.trim()) return getWilayas();
    return searchWilayas(wilayaQuery);
  }, [wilayaQuery]);

  const communes = useMemo(() => {
    if (!selectedWilaya) return [];
    const list = getCommunes(selectedWilaya.code);
    if (!communeQuery.trim()) return list;
    return list.filter((item) => item.includes(communeQuery.trim()));
  }, [selectedWilaya, communeQuery]);

  const wilayaLabel = selectedWilaya
    ? `${selectedWilaya.code} - ${selectedWilaya.name_ar} ${locale === "fr" ? `(${selectedWilaya.name_fr})` : ""}`
    : locale === "ar"
      ? "اختر الولاية"
      : "Choisir la wilaya";
  const communeLabel = selectedCommune || (locale === "ar" ? "اختر البلدية" : "Choisir la commune");

  return (
    <div ref={wrapperRef} className="grid gap-3">
      <div className="relative">
        <button
          type="button"
          onClick={() => setActiveDropdown((current) => (current === "wilaya" ? null : "wilaya"))}
          className={`input-base flex items-center justify-between gap-3 text-start ${
            required && !selectedWilaya ? "border-rose-300" : ""
          }`}
          aria-expanded={activeDropdown === "wilaya"}
        >
          <span className={`text-sm ${selectedWilaya ? "text-[var(--ink)]" : "text-[var(--muted)]"}`}>{wilayaLabel}</span>
          <span className="text-[var(--muted)]">▾</span>
        </button>

        {activeDropdown === "wilaya" ? (
          <div className="absolute z-50 mt-2 w-full rounded-[1.25rem] border border-[var(--line)] bg-white p-3 shadow-[0_20px_60px_rgba(10,34,84,0.12)]">
            <div className="flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--soft)] px-3 py-2">
              <span className="text-sm text-[var(--muted)]">🔍</span>
              <input
                type="search"
                value={wilayaQuery}
                onChange={(event) => setWilayaQuery(event.target.value)}
                placeholder={locale === "ar" ? "ابحث عن ولاية..." : "Rechercher une wilaya..."}
                className="w-full bg-transparent text-sm text-[var(--ink)] focus:outline-none"
              />
            </div>
            <div className="mt-3 max-h-60 overflow-y-auto rounded-xl border border-[var(--line)]">
              {wilayas.map((wilaya) => {
                const isSelected = wilaya.code === selectedWilaya?.code;
                return (
                  <button
                    type="button"
                    key={wilaya.code}
                    onClick={() => {
                      setSelectedWilaya(wilaya);
                      setSelectedCommune("");
                      setCommuneQuery("");
                      onWilayaChange(wilaya.code, wilaya.name_ar);
                      onCommuneChange("");
                      setActiveDropdown(null);
                    }}
                    className={`flex w-full items-center justify-between gap-3 px-4 py-2 text-sm transition ${
                      isSelected ? "bg-terracotta-pale text-terracotta" : "hover:bg-sand"
                    }`}
                  >
                    <span className="font-semibold">
                      {wilaya.code} - {wilaya.name_ar}
                    </span>
                    <span className="text-xs text-[var(--muted)]">{wilaya.name_fr}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => {
            if (!selectedWilaya) return;
            setActiveDropdown((current) => (current === "commune" ? null : "commune"));
          }}
          className={`input-base flex items-center justify-between gap-3 text-start ${
            required && selectedWilaya && !selectedCommune ? "border-rose-300" : ""
          } ${!selectedWilaya ? "cursor-not-allowed opacity-60" : ""}`}
          aria-expanded={activeDropdown === "commune"}
          disabled={!selectedWilaya}
        >
          <span className={`text-sm ${selectedCommune ? "text-[var(--ink)]" : "text-[var(--muted)]"}`}>
            {selectedWilaya ? communeLabel : locale === "ar" ? "اختر الولاية أولاً" : "Choisissez d'abord la wilaya"}
          </span>
          <span className="text-[var(--muted)]">▾</span>
        </button>

        {activeDropdown === "commune" ? (
          <div className="absolute z-50 mt-2 w-full rounded-[1.25rem] border border-[var(--line)] bg-white p-3 shadow-[0_20px_60px_rgba(10,34,84,0.12)]">
            <div className="flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--soft)] px-3 py-2">
              <span className="text-sm text-[var(--muted)]">🔍</span>
              <input
                type="search"
                value={communeQuery}
                onChange={(event) => setCommuneQuery(event.target.value)}
                placeholder={locale === "ar" ? "ابحث عن بلدية..." : "Rechercher une commune..."}
                className="w-full bg-transparent text-sm text-[var(--ink)] focus:outline-none"
              />
            </div>
            <div className="mt-3 max-h-60 overflow-y-auto rounded-xl border border-[var(--line)]">
              {communes.map((commune) => {
                const isSelected = commune === selectedCommune;
                return (
                  <button
                    type="button"
                    key={commune}
                    onClick={() => {
                      setSelectedCommune(commune);
                      onCommuneChange(commune);
                      setActiveDropdown(null);
                    }}
                    className={`flex w-full items-center justify-between px-4 py-2 text-sm transition ${
                      isSelected ? "bg-terracotta-pale text-terracotta" : "hover:bg-sand"
                    }`}
                  >
                    <span className="font-semibold">{commune}</span>
                    <span className="text-xs text-[var(--muted)]">
                      {selectedWilaya?.name_fr}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
