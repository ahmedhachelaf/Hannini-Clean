import { redirect } from "next/navigation";

type DashboardAliasPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function DashboardAliasPage({ params }: DashboardAliasPageProps) {
  const { locale } = await params;
  redirect(`/${locale}/provider`);
}
