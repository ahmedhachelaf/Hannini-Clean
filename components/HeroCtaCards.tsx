import Link from "next/link";
import type { Locale } from "@/lib/types";

type HeroCtaCardsProps = {
  locale: Locale;
  t: { providerMicro: string; providerTitle: string; seekerMicro: string; seekerTitle: string; };
  providerHref: string;
  seekerHref: string;
};

export function HeroCtaCards({ locale, t, providerHref, seekerHref }: HeroCtaCardsProps) {
  const isRtl = locale === "ar";
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2">
      <Link href={providerHref} className="group relative overflow-hidden rounded-[1.75rem] bg-terracotta p-6 shadow-[0_18px_40px_rgba(22,72,192,0.28)] transition hover:-translate-y-0.5 hover:bg-terracotta-light hover:shadow-[0_24px_48px_rgba(22,72,192,0.36)]">
        <div className="mb-4 inline-flex rounded-xl bg-white/20 p-2.5 text-2xl">🛠️</div>
        <div className="text-sm font-semibold text-white/75">{t.providerMicro}</div>
        <div className={`mt-1.5 text-2xl font-extrabold text-white ${isRtl ? "arabic-display" : ""}`}>{t.providerTitle}</div>
      </Link>
      <Link href={seekerHref} className="group relative overflow-hidden rounded-[1.75rem] border-2 border-white/20 bg-white/10 p-6 backdrop-blur transition hover:-translate-y-0.5 hover:border-olive-pale hover:bg-white/15">
        <div className="mb-4 inline-flex rounded-xl bg-olive-pale p-2.5 text-2xl">🔍</div>
        <div className="text-sm font-semibold text-white/75">{t.seekerMicro}</div>
        <div className={`mt-1.5 text-2xl font-extrabold text-white group-hover:text-olive-pale ${isRtl ? "arabic-display" : ""}`}>{t.seekerTitle}</div>
      </Link>
    </div>
  );
}
