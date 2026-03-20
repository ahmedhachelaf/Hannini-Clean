import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/forms/admin-login-form";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getDictionary, isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";

type AdminLoginPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminLoginPage({ params }: AdminLoginPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  if (await isAdminAuthenticated()) {
    redirect(`/${locale}/admin`);
  }

  const dictionary = getDictionary(locale);

  return (
    <div className="mx-auto flex w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <AdminLoginForm locale={locale} title={dictionary.admin.loginTitle} description={dictionary.admin.loginDescription} />
    </div>
  );
}
