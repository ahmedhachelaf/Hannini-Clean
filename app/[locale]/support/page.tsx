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
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <SupportForm
        locale={locale}
        defaultValues={{
          actorRole: (readValue(query.actor) as "customer" | "provider" | undefined) ?? "customer",
          bookingId: readValue(query.bookingId),
          providerId: readValue(query.providerId),
          providerSlug: readValue(query.providerSlug),
        }}
        labels={dictionary.support}
      />
    </div>
  );
}
