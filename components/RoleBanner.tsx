import Link from "next/link";
import type { Locale } from "@/lib/types";

type RoleBannerProps = {
  locale: Locale;
  t: {
    providerLabel: string;
    providerTitle: string;
    providerSub: string;
    seekerLabel: string;
    seekerTitle: string;
    seekerSub: string;
    divider: string;
  };
  providerHref: string;
  seekerHref: string;
};

export function RoleBanner({ locale, t, providerHref, seekerHref }: RoleBannerProps) {
  const isRtl = locale === "ar";
  return (
    <div className="w-full border-b border-terracotta/10 bg-cream">
      <div className="mx-auto flex max-w-7xl flex-col sm:flex-row">
        <Link href={providerHref} className="group flex flex-1 items-center gap-4 px-6 py-4 transition-colors hover:bg-terracotta-pale sm:justify-end sm:px-8">
          <div className="shrink-0 rounded-xl bg-terracotta-pale p-2.5 text-xl transition-colors group-hover:bg-terracotta/20">🛠️</div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-terracotta">{t.providerLabel}</div>
            <div className={`mt-0.5 text-[15px] font-extrabold text-ink-footer ${isRtl ? "arabic-display" : ""}`}>{t.providerTitle}</div>
            <div className="mt-0.5 text-xs leading-5 text-ink-mid">{t.providerSub}</div>
          </div>
          <span className="shrink-0 text-terracotta transition-transform group-hover:-translate-x-1" aria-hidden="true">{isRtl ? "←" : "→"}</span>
        </Link>
        <div className="flex items-center justify-center px-3 py-2 sm:py-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-terracotta/20 bg-white text-xs font-bold text-ink-soft shadow-sm">{t.divider}</div>
        </div>
        <Link href={seekerHref} className="group flex flex-1 items-center gap-4 px-6 py-4 transition-colors hover:bg-olive-pale sm:px-8">
          <div className="shrink-0 rounded-xl bg-olive-pale p-2.5 text-xl transition-colors group-hover:bg-olive/20">🔍</div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-olive">{t.seekerLabel}</div>
            <div className={`mt-0.5 text-[15px] font-extrabold text-ink-footer ${isRtl ? "arabic-display" : ""}`}>{t.seekerTitle}</div>
            <div className="mt-0.5 text-xs leading-5 text-ink-mid">{t.seekerSub}</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
