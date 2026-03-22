"use client";

import { useEffect, useMemo, useState } from "react";
import { getGrowTips } from "@/lib/grow-tips";
import type { Locale } from "@/lib/types";

type TipOfDayCardProps = {
  locale: Locale;
  labels: {
    title: string;
    todayBadge: string;
    firstVisitBadge: string;
    rotateLabel: string;
    totalLabel: string;
  };
  liveSoon: string;
};

const FIRST_VISIT_KEY = "hannini-grow-tip-first-visit";

export function TipOfDayCard({ locale, labels, liveSoon }: TipOfDayCardProps) {
  const tips = useMemo(() => getGrowTips(locale), [locale]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [firstVisit, setFirstVisit] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const seenKey = `${FIRST_VISIT_KEY}-${locale}`;
    const hasSeenFirstTip = typeof window !== "undefined" ? window.localStorage.getItem(seenKey) === "seen" : false;

    if (!hasSeenFirstTip) {
      setFirstVisit(true);
      setCurrentIndex(0);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(seenKey, "seen");
      }
      setReady(true);
      return;
    }

    const daySeed = Math.floor(Date.now() / 86_400_000);
    const rotatedIndex = tips.length > 1 ? 1 + (daySeed % (tips.length - 1)) : 0;
    setFirstVisit(false);
    setCurrentIndex(rotatedIndex);
    setReady(true);
  }, [locale, tips.length]);

  const activeTip = tips[currentIndex] ?? tips[0];

  function showNextTip() {
    setFirstVisit(false);
    setCurrentIndex((current) => {
      if (tips.length <= 1) {
        return current;
      }

      const next = current + 1 >= tips.length ? 1 : current + 1;
      return next === 0 ? 1 : next;
    });
  }

  return (
    <article className="surface-card rounded-[1.75rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(232,242,255,0.92))] p-6 shadow-[0_18px_40px_rgba(15,95,255,0.08)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className={`text-2xl font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{labels.title}</h2>
        <span className="status-pill border border-[var(--line)] bg-white text-[var(--ink)]">
          {firstVisit ? labels.firstVisitBadge : labels.todayBadge}
        </span>
      </div>
      <div className="mt-5 rounded-[1.5rem] border border-[rgba(15,95,255,0.12)] bg-white px-5 py-5 shadow-[0_12px_28px_rgba(15,95,255,0.06)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h3 className={`text-lg font-extrabold leading-8 text-[var(--navy)] ${locale === "ar" ? "arabic-display" : ""}`}>
              {activeTip.title}
            </h3>
            <p className="mt-2 text-base font-semibold leading-8 text-[var(--ink)]">{activeTip.body}</p>
          </div>
          <button type="button" onClick={showNextTip} className="button-secondary min-h-11 shrink-0 px-4 text-sm font-bold">
            {labels.rotateLabel}
          </button>
        </div>
        <p className="mt-4 text-xs leading-6 text-[var(--muted)]">
          {labels.totalLabel} {tips.length}
        </p>
      </div>
      <p className="mt-4 text-xs leading-6 text-[var(--muted)]">{ready ? liveSoon : " "}</p>
    </article>
  );
}
