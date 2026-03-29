import Image from "next/image";
import Link from "next/link";
import { ProviderSignupForm } from "@/components/forms/provider-signup-form";
import { getDictionary, isLocale } from "@/lib/i18n";
import { getCategories, getZones } from "@/lib/repository";
import { notFound } from "next/navigation";

type JoinPageProps = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{
    verification?: string;
    verifiedMethod?: string;
    verifiedTarget?: string;
  }>;
};

export default async function JoinPage({ params, searchParams }: JoinPageProps) {
  const { locale } = await params;
  const callbackState = searchParams ? await searchParams : undefined;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const [categories, zones] = await Promise.all([getCategories(), getZones()]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
        <ProviderSignupForm locale={locale} categories={categories} zones={zones} callbackState={callbackState} labels={dictionary.join} />

        <aside className="surface-card sticky top-28 rounded-[1.75rem] bg-[linear-gradient(180deg,rgba(13,28,69,0.98),rgba(20,92,255,0.9)_75%,rgba(96,165,250,0.78))] p-6 text-white shadow-[0_26px_60px_rgba(12,40,104,0.18)]">
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[1.75rem]">
            <div className="absolute -top-8 end-0 h-40 w-40 opacity-[0.16]">
              <Image src="/category-assets/background-3.png" alt="" fill sizes="160px" className="object-cover object-center [mask-image:radial-gradient(circle_at_center,black_44%,transparent_78%)]" />
            </div>
          </div>
          <div className="text-sm font-semibold uppercase tracking-[0.16em] text-white/72">{dictionary.nav.grow}</div>
          <h2 className={`mt-3 text-2xl font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{dictionary.grow.subtitle}</h2>
          <p className="mt-4 text-sm leading-8 text-white/82">{dictionary.grow.description}</p>

          <div className="relative mt-5 space-y-3">
            <div className="relative overflow-hidden rounded-[1.25rem] border border-white/12 bg-white/10 px-4 py-3 text-sm font-medium text-white/84 backdrop-blur-sm">
              <div className="pointer-events-none absolute inset-y-0 end-0 w-[38%] opacity-[0.4]">
                <Image src="/category-assets/vocational.png" alt="" fill sizes="160px" className="object-cover object-center" />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(13,28,69,0.96)_0%,rgba(13,28,69,0.72)_48%,rgba(13,28,69,0.12)_100%)]" />
              </div>
              <div className="relative max-w-[70%]">{dictionary.grow.laneService}</div>
            </div>
            <div className="relative overflow-hidden rounded-[1.25rem] border border-white/12 bg-white/10 px-4 py-3 text-sm font-medium text-white/84 backdrop-blur-sm">
              <div className="pointer-events-none absolute inset-y-0 end-0 w-[38%] opacity-[0.4]">
                <Image src="/category-assets/home-based.png" alt="" fill sizes="160px" className="object-cover object-center" />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(13,28,69,0.96)_0%,rgba(13,28,69,0.72)_48%,rgba(13,28,69,0.12)_100%)]" />
              </div>
              <div className="relative max-w-[70%]">{dictionary.grow.laneBusiness}</div>
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
