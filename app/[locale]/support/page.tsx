import { SupportForm } from "@/components/forms/support-form";
import { getDictionary, isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";

type SupportPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SupportPage({ params, searchParams }: SupportPageProps) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8 lg:py-10">
      <SupportForm
        locale={locale}
        defaultValues={{
          actorRole: (readValue(query.actor) as "customer" | "provider" | undefined) ?? "customer",
          category: readValue(query.category),
          bookingId: readValue(query.bookingId),
          providerId: readValue(query.providerId),
          providerSlug: readValue(query.providerSlug),
        }}
        labels={dictionary.support}
      />

      <aside className="surface-card rounded-[1.75rem] bg-[linear-gradient(180deg,rgba(13,28,69,0.98),rgba(20,92,255,0.9)_72%,rgba(96,165,250,0.76))] p-6 text-white shadow-[0_24px_60px_rgba(12,40,104,0.18)]">
        <div className="text-sm font-semibold uppercase tracking-[0.16em] text-white/70">{dictionary.safety.title}</div>
        <h2 className={`mt-3 text-2xl font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>{dictionary.safety.subtitle}</h2>
        <p className="mt-4 text-sm leading-8 text-white/82">{dictionary.safety.description}</p>

        <div className="mt-5 space-y-3">
          {dictionary.safety.quickActions.map((item) => (
            <div key={item} className="rounded-[1.25rem] border border-white/12 bg-white/10 px-4 py-3 text-sm leading-7 text-white/84">
              {item}
            </div>
          ))}
        </div>

        <a
          href={`/${locale}/safety`}
          className="button-secondary mt-6 border-white/18 bg-white/10 text-white shadow-[0_18px_36px_rgba(8,18,37,0.18)]"
        >
          {dictionary.safety.cta}
        </a>
      </aside>
    </div>
  );
}
