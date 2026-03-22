import Link from "next/link";
import { BusinessRequestForm } from "@/components/forms/business-request-form";
import { getDictionary, isLocale } from "@/lib/i18n";
import { getCategories, getZones } from "@/lib/repository";
import { notFound } from "next/navigation";

type BusinessPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function BusinessPage({ params }: BusinessPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const [categories, zones] = await Promise.all([getCategories(), getZones()]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <section className="surface-card gradient-frame rounded-[2rem] bg-[linear-gradient(135deg,rgba(255,255,255,0.99),rgba(227,239,255,0.96)_58%,rgba(206,225,255,0.92))] p-6 text-[var(--ink)] shadow-[0_30px_70px_rgba(12,40,104,0.18)] sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--ink)]">{dictionary.business.eyebrow}</div>
            <h1 className={`mt-3 text-4xl font-extrabold tracking-[-0.05em] sm:text-5xl ${locale === "ar" ? "arabic-display" : ""}`}>
              {dictionary.business.title}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-8 text-[var(--ink)]">{dictionary.business.description}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a href="#business-request-form" className="button-primary">
                {dictionary.business.cta}
              </a>
              <Link href={`/${locale}/providers`} className="button-secondary">
                {dictionary.business.browseProviders}
              </Link>
              <Link href={`/${locale}/businesses`} className="button-secondary">
                {dictionary.business.browseBusinesses}
              </Link>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-[rgba(15,95,255,0.12)] bg-white p-5 backdrop-blur">
            <div className="text-sm font-semibold text-[var(--ink)]">{dictionary.business.trustTitle}</div>
            <div className="mt-4 space-y-3">
              {dictionary.business.trustItems.map((item) => (
                <div key={item} className="rounded-[1.15rem] border border-[rgba(15,95,255,0.12)] bg-[var(--soft)] px-4 py-3 text-sm leading-7 text-[var(--ink)]">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <div className="surface-card rounded-[1.75rem] p-6">
            <h2 className={`text-2xl font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{dictionary.business.useCasesTitle}</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {dictionary.business.useCases.map((useCase) => (
                <article key={useCase.title} className="rounded-[1.5rem] border border-[rgba(15,95,255,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(231,240,255,0.88))] p-5 shadow-[0_18px_40px_rgba(15,95,255,0.08)]">
                  <h3 className={`text-lg font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{useCase.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{useCase.description}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="surface-card rounded-[1.75rem] p-6">
            <div className="grid gap-3 md:grid-cols-3">
              {dictionary.business.valuePoints.map((point) => (
                <div key={point} className="rounded-[1.25rem] border border-[rgba(15,95,255,0.12)] bg-[var(--soft)] px-4 py-4 text-sm leading-7 text-[var(--ink)]">
                  {point}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div id="business-request-form">
          <BusinessRequestForm locale={locale} categories={categories} zones={zones} labels={dictionary.business.form} />
        </div>
      </section>
    </div>
  );
}
