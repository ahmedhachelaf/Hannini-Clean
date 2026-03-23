import Link from "next/link";
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
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <div className="surface-card rounded-[1.75rem] p-6 text-center">
          <h1 className={`text-2xl font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>
            {locale === "ar" ? "دخول مزود الخدمة يتم الآن عبر الحساب" : "L’accès prestataire passe maintenant par le compte"}
          </h1>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
            {locale === "ar"
              ? "استخدم بريدك الإلكتروني وكلمة المرور للدخول إلى لوحتك. لم يعد هذا الرابط هو المسار العادي لإدارة الحساب."
              : "Utilisez votre e-mail et votre mot de passe pour accéder à votre tableau de bord. Ce lien n’est plus le chemin normal pour gérer votre compte."}
          </p>
          <Link href={`/${locale}/provider/login`} className="button-primary mx-auto mt-5 w-fit">
            {locale === "ar" ? "الذهاب إلى دخول مزود الخدمة" : "Aller à l’espace prestataire"}
          </Link>
        </div>
      </div>
    );
  }

  const [provider, zones] = await Promise.all([getProviderById(providerId, true), getZones()]);

  if (!provider || provider.verification.managementToken !== token) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <div className="surface-card rounded-[1.75rem] p-6 text-center">
          <h1 className={`text-2xl font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>
            {locale === "ar" ? "استخدم تسجيل الدخول إلى اللوحة" : "Utilisez la connexion au tableau de bord"}
          </h1>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
            {locale === "ar"
              ? "هذا الرابط لم يعد صالحاً كوسيلة أساسية للوصول. ادخل ببريدك الإلكتروني أو رقمك وكلمة المرور لفتح لوحة مزود الخدمة."
              : "Ce lien n’est plus le moyen principal d’accès. Connectez-vous avec votre e-mail ou votre numéro et votre mot de passe pour ouvrir le tableau de bord prestataire."}
          </p>
          <Link href={`/${locale}/provider/login`} className="button-primary mx-auto mt-5 w-fit">
            {locale === "ar" ? "دخول مزود الخدمة" : "Connexion prestataire"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="surface-card rounded-[1.5rem] border border-[rgba(20,92,255,0.12)] bg-[var(--soft)] p-5 text-sm leading-7 text-[var(--muted)]">
        {locale === "ar"
          ? "هذا رابط استرداد قديم. بعد حفظ التحديثات، استخدم بريدك الإلكتروني وكلمة المرور للدخول المعتاد إلى لوحة مزود الخدمة."
          : "Ceci est un ancien lien de récupération. Après vos mises à jour, utilisez votre e-mail et votre mot de passe pour revenir normalement à l’espace prestataire."}
      </div>
      <ProviderSelfServiceForm locale={locale} provider={provider} token={token} zones={zones} />
    </div>
  );
}
