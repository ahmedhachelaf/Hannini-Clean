import { notFound, redirect } from "next/navigation";
import { ProviderSelfServiceForm } from "@/components/providers/provider-self-service-form";
import { getAuthenticatedProvider } from "@/lib/provider-auth";
import { isLocale } from "@/lib/i18n";
import { getZones } from "@/lib/repository";

type ProviderProfilePageProps = {
  params: Promise<{ locale: string }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProviderProfilePage({ params }: ProviderProfilePageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const provider = await getAuthenticatedProvider();

  if (!provider) {
    redirect(`/${locale}/provider/login`);
  }

  const zones = await getZones();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <ProviderSelfServiceForm locale={locale} provider={provider} zones={zones} />
    </div>
  );
}
