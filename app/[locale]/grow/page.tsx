import Link from "next/link";
import { getDictionary, isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";

type GrowPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function GrowPage({ params }: GrowPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <section className="surface-card gradient-frame rounded-[2rem] bg-[linear-gradient(135deg,rgba(13,28,69,0.98),rgba(20,92,255,0.92)_72%,rgba(96,165,250,0.84))] p-6 text-white shadow-[0_30px_70px_rgba(12,40,104,0.18)] sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.16em] text-white/72">{dictionary.nav.grow}</div>
            <h1 className={`mt-3 text-4xl font-extrabold tracking-[-0.05em] sm:text-5xl ${locale === "ar" ? "arabic-display" : ""}`}>
              {dictionary.grow.title}
            </h1>
            <p className="mt-4 text-lg font-semibold text-white/84">{dictionary.grow.subtitle}</p>
            <p className="mt-4 max-w-3xl text-sm leading-8 text-white/82">{dictionary.grow.description}</p>
          </div>

          <div className="rounded-[1.5rem] border border-white/12 bg-white/10 p-5 backdrop-blur">
            <div className="text-sm font-semibold text-white/74">{dictionary.nav.providers}</div>
            <div className="mt-2 text-sm leading-7 text-white/82">{dictionary.grow.laneService}</div>
            <div className="mt-4 text-sm font-semibold text-white/74">{dictionary.nav.businesses}</div>
            <div className="mt-2 text-sm leading-7 text-white/82">{dictionary.grow.laneBusiness}</div>
            <div className="mt-5 rounded-[1.25rem] border border-white/12 bg-[rgba(8,18,37,0.18)] px-4 py-4 text-sm leading-7 text-white/80">
              {dictionary.grow.academySoon}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="surface-card rounded-[1.75rem] p-6">
          <h2 className={`text-2xl font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{dictionary.grow.checklistTitle}</h2>
          <div className="mt-5 space-y-3">
            {dictionary.grow.checklistItems.map((item, index) => (
              <div key={item} className="rounded-[1.35rem] border border-[rgba(15,95,255,0.12)] bg-[var(--soft)] p-4 shadow-[0_10px_24px_rgba(15,95,255,0.06)]">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--navy)] text-sm font-extrabold text-white">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-7 text-[var(--muted)]">{item}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className={`section-title font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{dictionary.grow.guidesTitle}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
                {locale === "ar"
                  ? "بطاقات قصيرة ومباشرة تساعدك تبدأ بطريقة أوضح وتبني ثقة أفضل مع الزبائن."
                  : "Des cartes courtes et concrètes pour démarrer plus clairement et inspirer davantage confiance aux clients."}
              </p>
            </div>
            <Link href={`/${locale}/join`} className="button-secondary">
              {dictionary.join.title}
            </Link>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            {dictionary.grow.guides.map((guide) => (
              <article key={guide.title} className="surface-card rounded-[1.75rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(231,240,255,0.88))] p-6 shadow-[0_18px_40px_rgba(15,95,255,0.08)]">
                <h3 className={`text-xl font-extrabold tracking-tight ${locale === "ar" ? "arabic-display" : ""}`}>{guide.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{guide.description}</p>
                <ul className="mt-5 space-y-3">
                  {guide.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-3 rounded-[1.15rem] border border-[rgba(15,95,255,0.12)] bg-white px-4 py-3 text-sm leading-7 text-[var(--muted)]">
                      <span className="mt-1 inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--accent)]" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <div className="surface-card rounded-[1.75rem] bg-[linear-gradient(135deg,rgba(13,28,69,0.98),rgba(20,92,255,0.9)_72%,rgba(96,165,250,0.76))] p-6 text-white shadow-[0_24px_60px_rgba(12,40,104,0.16)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className={`text-2xl font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{dictionary.grow.safetyTitle}</h2>
                <p className="mt-3 max-w-3xl text-sm leading-8 text-white/82">{dictionary.grow.safetyDescription}</p>
              </div>
              <Link href={`/${locale}/safety`} className="button-secondary border-white/18 bg-white/10 text-white shadow-[0_18px_36px_rgba(8,18,37,0.18)]">
                {dictionary.nav.safety}
              </Link>
            </div>
            <div className="mt-5 grid gap-3 lg:grid-cols-2">
              {dictionary.grow.safetyItems.map((item) => (
                <div key={item} className="rounded-[1.25rem] border border-white/12 bg-white/10 px-4 py-3 text-sm leading-7 text-white/84">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
