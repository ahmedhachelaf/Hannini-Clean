import { SupportThread } from "@/components/support/support-thread";
import { getDictionary, isLocale } from "@/lib/i18n";
import { getSupportCaseById } from "@/lib/repository";
import { notFound } from "next/navigation";

type SupportThreadPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function SupportThreadPage({ params }: SupportThreadPageProps) {
  const { locale, id } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const supportCase = await getSupportCaseById(id);

  if (!supportCase) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <SupportThread locale={locale} supportCase={supportCase} labels={dictionary.support} />
    </div>
  );
}
