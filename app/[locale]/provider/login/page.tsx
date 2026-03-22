import { notFound } from "next/navigation";
import { ProviderLoginForm } from "@/components/forms/provider-login-form";
import { isLocale } from "@/lib/i18n";

type ProviderLoginPageProps = {
  params: Promise<{ locale: string }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProviderLoginPage({ params }: ProviderLoginPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <ProviderLoginForm locale={locale} />
    </div>
  );
}
