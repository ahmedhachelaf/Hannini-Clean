#!/usr/bin/env python3
import os

def write(path, content):
    os.makedirs(os.path.dirname(path) or '.', exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"✓ created {path}")

def patch(path, old, new):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    if old not in content:
        print(f"⚠ skip (not found): {path}")
        return
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content.replace(old, new, 1))
    print(f"✓ patched {path}")

# ── 1. NEW FILE: components/RoleBanner.tsx ──────────────────────────
write("components/RoleBanner.tsx", '''import Link from "next/link";
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
''')

# ── 2. NEW FILE: components/HeroCtaCards.tsx ────────────────────────
write("components/HeroCtaCards.tsx", '''import Link from "next/link";
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
      <Link href={providerHref} className="group relative overflow-hidden rounded-[1.75rem] bg-terracotta p-6 shadow-[0_18px_40px_rgba(196,97,42,0.28)] transition hover:-translate-y-0.5 hover:bg-terracotta-light hover:shadow-[0_24px_48px_rgba(196,97,42,0.36)]">
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
''')

# ── 3. NEW FILE: components/JourneySection.tsx ──────────────────────
write("components/JourneySection.tsx", '''import Link from "next/link";
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
    <section id="join-henini" className="relative isolate overflow-hidden rounded-[2rem] p-8 sm:p-10" style={{ background: "linear-gradient(135deg, #C4612A 0%, #A84E22 100%)" }}>
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
''')

# ── 4. NEW FILE: components/FooterV2.tsx ────────────────────────────
write("components/FooterV2.tsx", '''import { Suspense } from "react";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import type { Locale } from "@/lib/types";

type FooterV2Props = {
  locale: Locale;
  nav: { home: string; providers: string; businesses: string; grow: string; safety: string; join: string; support: string; };
  footer: {
    tagline: string; platformLabel: string; localServices: string; homeServices: string; howItWorks: string; about: string;
    legalLabel: string; terms: string; privacy: string; conduct: string; report: string;
    copyright: string; bottomTerms: string; bottomPrivacy: string; bottomConduct: string; bottomReport: string;
  };
  localeLabel: string;
  alternateLocaleLabel: string;
};

export function FooterV2({ locale, nav, footer, localeLabel, alternateLocaleLabel }: FooterV2Props) {
  const isRtl = locale === "ar";
  return (
    <footer>
      <div className="bg-ink-footer">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:gap-8 lg:px-8 lg:py-14">
          <div className="space-y-3">
            <div className={`text-3xl font-extrabold text-white ${isRtl ? "arabic-display" : ""}`}>هَنّيني</div>
            <p className="text-sm leading-7 text-white/45">{footer.tagline}</p>
          </div>
          <div className="space-y-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">{footer.platformLabel}</div>
            <nav className="flex flex-col gap-2">
              <Link href={`/${locale}/providers`} className="text-sm text-white/55 transition hover:text-white">{footer.localServices}</Link>
              <Link href={`/${locale}/businesses`} className="text-sm text-white/55 transition hover:text-white">{footer.homeServices}</Link>
              <Link href={`/${locale}/grow`} className="text-sm text-white/55 transition hover:text-white">{footer.howItWorks}</Link>
              <Link href={`/${locale}/safety`} className="text-sm text-white/55 transition hover:text-white">{footer.about}</Link>
            </nav>
          </div>
          <div className="space-y-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">{footer.legalLabel}</div>
            <nav className="flex flex-col gap-2">
              <Link href={`/${locale}/conduct`} className="text-sm text-white/55 transition hover:text-white">{footer.terms}</Link>
              <Link href={`/${locale}/safety`} className="text-sm text-white/55 transition hover:text-white">{footer.privacy}</Link>
              <Link href={`/${locale}/conduct`} className="text-sm text-white/55 transition hover:text-white">{footer.conduct}</Link>
              <Link href={`/${locale}/support`} className="text-sm text-white/55 transition hover:text-white">{footer.report}</Link>
            </nav>
            <div className="mt-5">
              <Suspense fallback={null}>
                <LanguageSwitcher locale={locale} labels={{ current: localeLabel, alternate: alternateLocaleLabel }} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/8 bg-ink-footer">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-5 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-white/40">
            <Link href={`/${locale}/conduct`} className="transition hover:text-white/70 hover:underline underline-offset-2">{footer.bottomTerms}</Link>
            <span aria-hidden="true">•</span>
            <Link href={`/${locale}/safety`} className="transition hover:text-white/70 hover:underline underline-offset-2">{footer.bottomPrivacy}</Link>
            <span aria-hidden="true">•</span>
            <Link href={`/${locale}/conduct`} className="transition hover:text-white/70 hover:underline underline-offset-2">{footer.bottomConduct}</Link>
            <span aria-hidden="true">•</span>
            <Link href={`/${locale}/support`} className="transition hover:text-white/70 hover:underline underline-offset-2">{footer.bottomReport}</Link>
          </div>
          <p className="text-xs text-white/40">{footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
''')

# ── 5. PATCH: tailwind.config.ts ────────────────────────────────────
patch("tailwind.config.ts",
    'accentStrong: "var(--accent-strong)",',
    '''accentStrong: "var(--accent-strong)",
        // v2.0 design tokens
        terracotta: "#C4612A",
        "terracotta-light": "#E8835A",
        "terracotta-pale": "#FAEDE4",
        olive: "#5A6E3A",
        "olive-light": "#7A9250",
        "olive-pale": "#EBF0E2",
        "ink-footer": "#1E1A14",
        "ink-mid": "#4A4035",
        "ink-soft": "#8A7E72",
        cream: "#FFFDF9",
        gold: "#C4922A",
        "gold-pale": "#FBF3E2",
        sand: "#F7F3ED",
        "sand-dark": "#EDE6DB",''')

# ── 6. PATCH: messages/ar.ts ─────────────────────────────────────────
AR_NEW = '''  roleBanner: {
    providerLabel: "للمهنيين والحرفيين",
    providerTitle: "أنا مزوّد خدمة",
    providerSub: "سجّل ملفك واوصل مهارتك بالزبائن",
    seekerLabel: "للأسر والزبائن",
    seekerTitle: "أبحث عن خدمة",
    seekerSub: "اعثر على مزوّد موثوق في منطقتك",
    divider: "أو",
  },
  heroCtaCards: {
    providerMicro: "كمزوّد خدمة",
    providerTitle: "سجّل ملفك المهني",
    seekerMicro: "كزبون",
    seekerTitle: "ابحث عن خدمة",
  },
  journey: {
    eyebrow: "ابدأ رحلتك معنا",
    headline: "أنت في المكان الصحيح",
    sub: "سواء كنت تبحث عن فرصة أو خدمة — هَنّيني مبنية لك.",
    providerRole: "للحرفيين وأصحاب المشاريع",
    providerTitle: "كمزوّد خدمة",
    providerDesc: "أنشئ ملفك المهني، اعرض أعمالك، وابدأ في استقبال طلبات حقيقية من زبائن في منطقتك.",
    providerCta: "سجّل ملفك مجاناً ←",
    seekerRole: "للأسر والزبائن",
    seekerTitle: "أبحث عن خدمة",
    seekerDesc: "اعثر على مزوّد موثوق ومُعتمَد في منطقتك — سباك، طبّاخة، خيّاطة، وأكثر.",
    seekerCta: "ابحث الآن ←",
    legalPrefix: "بالتسجيل توافق على",
    termsLink: "شروط الاستخدام",
    privacyLink: "سياسة الخصوصية",
    conductLink: "مدونة السلوك",
  },
  footer: {
    tagline: "منصة الثقة والرزق المحلي — الجزائر",
    platformLabel: "المنصة",
    localServices: "الخدمات المحلية",
    homeServices: "الأعمال المنزلية",
    howItWorks: "كيف تعمل؟",
    about: "عن هَنّيني",
    legalLabel: "القانوني والأمان",
    terms: "الشروط والأحكام",
    privacy: "سياسة الخصوصية",
    conduct: "مدونة السلوك",
    report: "الإبلاغ عن مشكلة",
    copyright: "© 2025 هَنّيني — جميع الحقوق محفوظة",
    bottomTerms: "الشروط",
    bottomPrivacy: "الخصوصية",
    bottomConduct: "مدونة السلوك",
    bottomReport: "الإبلاغ",
  },
};'''

with open("messages/ar.ts", "r", encoding="utf-8") as f:
    ar = f.read()
last = ar.rfind("};")
if last != -1 and "roleBanner" not in ar:
    with open("messages/ar.ts", "w", encoding="utf-8") as f:
        f.write(ar[:last] + AR_NEW + "\n")
    print("✓ patched messages/ar.ts")
else:
    print("⚠ messages/ar.ts: already patched or marker not found")

# ── 7. PATCH: messages/fr.ts ─────────────────────────────────────────
FR_NEW = '''  roleBanner: {
    providerLabel: "Pour les professionnels et artisans",
    providerTitle: "Je suis prestataire",
    providerSub: "Créez votre profil et connectez votre savoir-faire aux clients",
    seekerLabel: "Pour les foyers et clients",
    seekerTitle: "Je cherche un service",
    seekerSub: "Trouvez un prestataire fiable dans votre région",
    divider: "ou",
  },
  heroCtaCards: {
    providerMicro: "En tant que prestataire",
    providerTitle: "Créez votre profil",
    seekerMicro: "En tant que client",
    seekerTitle: "Trouver un service",
  },
  journey: {
    eyebrow: "Commencez votre parcours",
    headline: "Vous êtes au bon endroit",
    sub: "Que vous cherchiez une opportunité ou un service — Hannini est fait pour vous.",
    providerRole: "Pour artisans et entrepreneurs",
    providerTitle: "En tant que prestataire",
    providerDesc: "Créez votre profil professionnel, présentez vos réalisations et commencez à recevoir de vraies demandes de clients dans votre région.",
    providerCta: "Créez votre profil gratuitement →",
    seekerRole: "Pour les foyers et clients",
    seekerTitle: "Je cherche un service",
    seekerDesc: "Trouvez un prestataire fiable et vérifié dans votre région — plombier, cuisinière, couturière et plus encore.",
    seekerCta: "Rechercher maintenant →",
    legalPrefix: "En vous inscrivant, vous acceptez",
    termsLink: "les CGU",
    privacyLink: "la Confidentialité",
    conductLink: "le Code de conduite",
  },
  footer: {
    tagline: "Plateforme de confiance et de revenus locaux — Algérie",
    platformLabel: "Plateforme",
    localServices: "Services locaux",
    homeServices: "Activités à domicile",
    howItWorks: "Comment ça marche ?",
    about: "À propos de Hannini",
    legalLabel: "Légal et sécurité",
    terms: "Conditions d\'utilisation",
    privacy: "Politique de confidentialité",
    conduct: "Code de conduite",
    report: "Signaler un problème",
    copyright: "© 2025 Hannini — Tous droits réservés",
    bottomTerms: "CGU",
    bottomPrivacy: "Confidentialité",
    bottomConduct: "Conduite",
    bottomReport: "Signaler",
  },
};'''

with open("messages/fr.ts", "r", encoding="utf-8") as f:
    fr = f.read()
last = fr.rfind("};")
if last != -1 and "roleBanner" not in fr:
    with open("messages/fr.ts", "w", encoding="utf-8") as f:
        f.write(fr[:last] + FR_NEW + "\n")
    print("✓ patched messages/fr.ts")
else:
    print("⚠ messages/fr.ts: already patched or marker not found")

# ── 8. PATCH: app/[locale]/layout.tsx ───────────────────────────────
patch('app/[locale]/layout.tsx',
    'import { SiteFooter } from "@/components/layout/site-footer";',
    'import { FooterV2 } from "@/components/FooterV2";')

patch('app/[locale]/layout.tsx',
    '<SiteFooter locale={locale} nav={dictionary.nav} />',
    '''<FooterV2
          locale={locale}
          nav={dictionary.nav}
          footer={dictionary.footer}
          localeLabel={dictionary.localeLabel}
          alternateLocaleLabel={dictionary.alternateLocaleLabel}
        />''')

# ── 9. PATCH: components/home/home-page-content.tsx ─────────────────
patch('components/home/home-page-content.tsx',
    'import Link from "next/link";\nimport { HomeSearchForm }',
    '''import Link from "next/link";
import { HeroCtaCards } from "@/components/HeroCtaCards";
import { JourneySection } from "@/components/JourneySection";
import { RoleBanner } from "@/components/RoleBanner";
import { HomeSearchForm }''')

patch('components/home/home-page-content.tsx',
    '      statsZones: string;\n      statsCategories: string;\n    };\n  };\n  categories: Category[];',
    '''      statsZones: string;
      statsCategories: string;
    };
    roleBanner: { providerLabel: string; providerTitle: string; providerSub: string; seekerLabel: string; seekerTitle: string; seekerSub: string; divider: string; };
    heroCtaCards: { providerMicro: string; providerTitle: string; seekerMicro: string; seekerTitle: string; };
    journey: { eyebrow: string; headline: string; sub: string; providerRole: string; providerTitle: string; providerDesc: string; providerCta: string; seekerRole: string; seekerTitle: string; seekerDesc: string; seekerCta: string; legalPrefix: string; termsLink: string; privacyLink: string; conductLink: string; };
  };
  categories: Category[];''')

patch('components/home/home-page-content.tsx',
    '  return (\n    <div className="mx-auto flex w-full max-w-7xl',
    '''  return (
    <>
      <RoleBanner locale={locale} t={dictionary.roleBanner} providerHref={`/${locale}/join`} seekerHref={`/${locale}/providers`} />
    <div className="mx-auto flex w-full max-w-7xl''')

OLD_LANES = '''            <div className="mt-8 min-w-0 space-y-4">
              <div className="text-sm font-semibold uppercase tracking-[0.14em] text-white/82">{dictionary.home.lanesTitle}</div>
              <div className="grid gap-4 lg:grid-cols-2">
                <Link
                  href={`/${locale}/providers`}
                  className="rounded-[1.75rem] border border-white/12 bg-[linear-gradient(180deg,rgba(8,23,69,0.34),rgba(15,47,126,0.24))] p-5 shadow-[0_24px_48px_rgba(8,18,37,0.2)] backdrop-blur"
                >
                  <div className="text-sm font-semibold text-white/82">{locale === "ar" ? "المسار الأول" : "Volet 1"}</div>
                  <div className={`mt-2 text-2xl font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{dictionary.home.servicesLaneTitle}</div>
                  <p className="mt-3 text-sm leading-7 text-white/88">{dictionary.home.servicesLaneDescription}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {serviceCategories.slice(0, 4).map((category) => (
                      <span key={category.slug} className="chip-button max-w-full border-white/10 bg-[rgba(255,255,255,0.12)] text-white text-xs">
                        {category.icon} {getLocalizedValue(category.name, locale)}
                      </span>
                    ))}
                  </div>
                  <div className="mt-5 text-sm font-bold text-white">{dictionary.home.servicesLaneCta}</div>
                </Link>

                <Link
                  href={`/${locale}/businesses`}
                  className="rounded-[1.75rem] border border-white/12 bg-[linear-gradient(180deg,rgba(16,44,112,0.34),rgba(33,83,182,0.24))] p-5 shadow-[0_24px_48px_rgba(8,18,37,0.2)] backdrop-blur"
                >
                  <div className="text-sm font-semibold text-white/82">{locale === "ar" ? "المسار الثاني" : "Volet 2"}</div>
                  <div className={`mt-2 text-2xl font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{dictionary.home.businessesLaneTitle}</div>
                  <p className="mt-3 text-sm leading-7 text-white/88">{dictionary.home.businessesLaneDescription}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {businessCategories.slice(0, 4).map((category) => (
                      <span key={category.slug} className="chip-button max-w-full border-white/10 bg-[rgba(255,255,255,0.12)] text-white text-xs">
                        {category.icon} {getLocalizedValue(category.name, locale)}
                      </span>
                    ))}
                  </div>
                  <div className="mt-5 text-sm font-bold text-white">{dictionary.home.businessesLaneCta}</div>
                </Link>
              </div>
            </div>'''

NEW_LANES = '''            <HeroCtaCards locale={locale} t={dictionary.heroCtaCards} providerHref={`/${locale}/join`} seekerHref={`/${locale}/providers`} />'''

patch('components/home/home-page-content.tsx', OLD_LANES, NEW_LANES)

OLD_JOIN = '''      <section id="join-henini" className="surface-card rounded-[2rem] bg-[linear-gradient(135deg,rgba(255,255,255,0.99),rgba(227,239,255,0.96)_58%,rgba(206,225,255,0.92))] p-6 text-[var(--ink)] sm:p-8">
        <div className="mb-6 rounded-[1.5rem] border border-[rgba(15,95,255,0.12)] bg-white p-5 backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--ink)]">{dictionary.nav.grow}</div>
              <h2 className={`mt-2 text-2xl font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>
                {dictionary.home.growTitle}
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-8 text-[var(--ink)]">{dictionary.home.growDescription}</p>
            </div>
            <div className="flex flex-col gap-3 lg:max-w-sm">
              <span className="rounded-[1.25rem] border border-[rgba(15,95,255,0.12)] bg-[var(--soft)] px-4 py-3 text-sm font-semibold text-[var(--ink)]">
                {dictionary.home.growSoon}
              </span>
              <Link href={`/${locale}/grow`} className="button-secondary">
                {dictionary.home.growCta}
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div>
            <h2 className={`section-title font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>
              {dictionary.home.joinTitle}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-[var(--ink)]">
              {dictionary.home.joinDescription}
            </p>
          </div>
          <Link href={`/${locale}/join`} className="button-secondary">
            {dictionary.home.joinCta}
          </Link>
        </div>
      </section>
    </div>
  );
}'''

NEW_JOIN = '''      <JourneySection locale={locale} t={dictionary.journey} providerHref={`/${locale}/join`} seekerHref={`/${locale}/providers`} conductHref={`/${locale}/conduct`} privacyHref={`/${locale}/safety`} termsHref={`/${locale}/conduct`} />
    </div>
    </>
  );
}'''

patch('components/home/home-page-content.tsx', OLD_JOIN, NEW_JOIN)

print("\n✅ Done! Now run:")
print("   git add .")
print('   git commit -m "feat: apply v2.0 design enhancements"')
print("   git push -u origin hannini-2.0")
