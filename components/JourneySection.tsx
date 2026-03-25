import Link from "next/link";
import type { Locale } from "@/lib/types";

type JourneySectionProps = {
  locale: Locale;
  t: {
    eyebrow: string; headline: string; sub: string;
    providerRole: string; providerTitle: string; providerDesc: string; providerCta: string;
    seekerRole: string; seekerTitle: string; seekerDesc: string; seekerCta: string;
    legalPrefix: string; termsLink: string; privacyLink: string; conductLink: string;
  };
  providerHref: string; seekerHref: string;
  termsHref?: string; privacyHref?: string; conductHref?: string;
};

export function JourneySection({ locale, t, providerHref, seekerHref, termsHref = "#", privacyHref = "#", conductHref = "#" }: JourneySectionProps) {
  const isRtl = locale === "ar";
  return (
    <section id="join-henini" className="relative isolate overflow-hidden rounded-[2rem] p-8 sm:p-10" style={{ background: "linear-gradient(135deg, #0d1c45 0%, #1648c0 100%)" }}>
      <div className={`pointer-events-none absolute inset-0 flex items-center justify-center select-none font-extrabold text-white/5 ${isRtl ? "arabic-display" : ""}`} style={{ fontSize: "clamp(100px, 18vw, 200px)", lineHeight: 1 }} aria-hidden="true">هَنّيني</div>
      <div className="relative z-[1] flex flex-col items-center gap-8 text-center">
        <div className="inline-flex rounded-full border border-white/30 bg-white/10 px-5 py-2 text-sm font-semibold text-white backdrop-blur">{t.eyebrow}</div>
        <div>
          <h2 className={`text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl ${isRtl ? "arabic-display" : ""}`}>{t.headline}</h2>
          <p className="mt-4 max-w-xl text-base leading-8 text-white/80">{t.sub}</p>
        </div>
        <div className="grid w-full max-w-3xl gap-5 sm:grid-cols-2">
          <div className="group flex flex-col gap-5 rounded-[1.75rem] bg-white p-6 shadow-[0_20px_48px_rgba(0,0,0,0.18)] transition hover:-translate-y-1 hover:ring-2 hover:ring-terracotta">
            <div className="inline-flex w-fit rounded-xl bg-terracotta-pale p-3 text-2xl">🛠️</div>
            <div className={isRtl ? "text-right" : "text-left"}>
              <div className="text-xs font-semibold uppercase tracking-widest text-ink-soft">{t.providerRole}</div>
              <div className={`mt-1 text-xl font-extrabold text-terracotta ${isRtl ? "arabic-display" : ""}`}>{t.providerTitle}</div>
              <p className="mt-3 text-sm leading-7 text-ink-mid">{t.providerDesc}</p>
            </div>
            <Link href={providerHref} className="mt-auto inline-flex items-center justify-center rounded-[1.25rem] bg-terracotta px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-terracotta-light">{t.providerCta}</Link>
          </div>
          <div className="group flex flex-col gap-5 rounded-[1.75rem] bg-white p-6 shadow-[0_20px_48px_rgba(0,0,0,0.18)] transition hover:-translate-y-1 hover:ring-2 hover:ring-olive">
            <div className="inline-flex w-fit rounded-xl bg-olive-pale p-3 text-2xl">🔍</div>
            <div className={isRtl ? "text-right" : "text-left"}>
              <div className="text-xs font-semibold uppercase tracking-widest text-ink-soft">{t.seekerRole}</div>
              <div className={`mt-1 text-xl font-extrabold text-olive ${isRtl ? "arabic-display" : ""}`}>{t.seekerTitle}</div>
              <p className="mt-3 text-sm leading-7 text-ink-mid">{t.seekerDesc}</p>
            </div>
            <Link href={seekerHref} className="mt-auto inline-flex items-center justify-center rounded-[1.25rem] bg-olive px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-olive-light">{t.seekerCta}</Link>
          </div>
        </div>
        <p className="max-w-lg text-xs text-white/55">
          {t.legalPrefix}{" "}
          <Link href={termsHref} className="text-white/70 underline-offset-2 hover:underline">{t.termsLink}</Link>
          {" • "}
          <Link href={privacyHref} className="text-white/70 underline-offset-2 hover:underline">{t.privacyLink}</Link>
          {" • "}
          <Link href={conductHref} className="text-white/70 underline-offset-2 hover:underline">{t.conductLink}</Link>
        </p>
      </div>
    </section>
  );
}
