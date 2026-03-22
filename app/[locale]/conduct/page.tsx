import Link from "next/link";
import { getDictionary, isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";

type ConductPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ConductPage({ params }: ConductPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <section className="surface-card rounded-[2rem] bg-[linear-gradient(135deg,rgba(13,28,69,0.98),rgba(20,92,255,0.92)_72%,rgba(96,165,250,0.78))] p-6 text-white shadow-[0_28px_60px_rgba(12,40,104,0.18)] sm:p-8">
        <div className="max-w-3xl">
          <div className="text-sm font-semibold uppercase tracking-[0.16em] text-white/74">{dictionary.conduct.eyebrow}</div>
          <h1 className={`mt-3 text-4xl font-extrabold tracking-[-0.05em] sm:text-5xl ${locale === "ar" ? "arabic-display" : ""}`}>
            {dictionary.conduct.title}
          </h1>
          <p className="mt-4 text-sm leading-8 text-white/84">{dictionary.conduct.description}</p>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        {dictionary.conduct.sections.map((section) => (
          <article key={section.title} className="surface-card rounded-[1.75rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(231,240,255,0.9))] p-6 shadow-[0_18px_40px_rgba(15,95,255,0.08)]">
            <h2 className={`text-2xl font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{section.title}</h2>
            <ul className="mt-5 space-y-3">
              {section.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3 rounded-[1.15rem] border border-[rgba(15,95,255,0.12)] bg-white px-4 py-3 text-sm leading-7 text-[var(--muted)]">
                  <span className="mt-2 inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--accent)]" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="surface-card rounded-[1.75rem] p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className={`text-2xl font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{dictionary.conduct.reportingTitle}</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{dictionary.conduct.reportingDescription}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={`/${locale}/support?category=unsafe_behavior`} className="button-primary">
              {dictionary.conduct.reportUnsafe}
            </Link>
            <Link href={`/${locale}/join`} className="button-secondary">
              {dictionary.conduct.joinCta}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
