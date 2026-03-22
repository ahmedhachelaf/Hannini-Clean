import { notFound } from "next/navigation";
import { ProviderSelfServiceForm } from "@/components/providers/provider-self-service-form";
import { getProviderById, getZones } from "@/lib/repository";
import { isLocale } from "@/lib/i18n";

type ManageJoinPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ provider?: string; token?: string }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ManageJoinPage({ params, searchParams }: ManageJoinPageProps) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);

  if (!isLocale(locale)) {
    notFound();
  }

  const providerId = query.provider;
  const token = query.token;

  if (!providerId || !token) {
    notFound();
  }

  const [provider, zones] = await Promise.all([getProviderById(providerId, true), getZones()]);

  if (!provider || provider.verification.managementToken !== token) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <div className="surface-card rounded-[1.75rem] p-6 text-center">
          <h1 className={`text-2xl font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>
            {locale === "ar" ? "رابط الإدارة غير صالح" : "Lien de gestion invalide"}
          </h1>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
            {locale === "ar"
              ? "تحقق من رابط الإدارة الذي وصلك بعد إرسال الطلب أو أرسل طلباً جديداً إذا لزم الأمر."
              : "Vérifiez le lien de gestion reçu après l’envoi de la candidature, ou envoyez une nouvelle demande si besoin."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <ProviderSelfServiceForm locale={locale} provider={provider} token={token} zones={zones} />
    </div>
  );
}
