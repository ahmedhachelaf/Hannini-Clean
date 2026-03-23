import Link from "next/link";
import { ProviderSignupForm } from "@/components/forms/provider-signup-form";
import { getDictionary, isLocale } from "@/lib/i18n";
import { getCategories, getZones } from "@/lib/repository";
import { notFound } from "next/navigation";

type JoinPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function JoinPage({ params }: JoinPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const [categories, zones] = await Promise.all([getCategories(), getZones()]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
        <ProviderSignupForm locale={locale} categories={categories} zones={zones} labels={dictionary.join} />

        <aside className="surface-card sticky top-28 rounded-[1.75rem] bg-[linear-gradient(180deg,rgba(13,28,69,0.98),rgba(20,92,255,0.9)_75%,rgba(96,165,250,0.78))] p-6 text-white shadow-[0_26px_60px_rgba(12,40,104,0.18)]">
          <div className="text-sm font-semibold uppercase tracking-[0.16em] text-white/72">{dictionary.nav.grow}</div>
          <h2 className={`mt-3 text-2xl font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{dictionary.grow.subtitle}</h2>
          <p className="mt-4 text-sm leading-8 text-white/82">{dictionary.grow.description}</p>

          <div className="mt-5 space-y-3">
            <div className="rounded-[1.25rem] border border-white/12 bg-white/10 px-4 py-3 text-sm font-medium text-white/84">
              {dictionary.grow.laneService}
            </div>
            <div className="rounded-[1.25rem] border border-white/12 bg-white/10 px-4 py-3 text-sm font-medium text-white/84">
              {dictionary.grow.laneBusiness}
            </div>
          </div>

          <div className="mt-5 rounded-[1.25rem] border border-white/12 bg-[rgba(8,18,37,0.18)] px-4 py-4 text-sm leading-7 text-white/80">
            {dictionary.grow.academySoon}
          </div>

          <Link
            href={`/${locale}/grow`}
            className="button-secondary mt-5 w-full border-white/20 bg-white/12 text-center text-white shadow-[0_18px_36px_rgba(8,18,37,0.18)]"
          >
            {dictionary.nav.grow}
          </Link>
        </aside>
      </div>
    </div>
  );
}
