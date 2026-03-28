import { revalidatePath } from "next/cache";
import { locales } from "@/lib/i18n";

export function revalidateMarketplacePaths(providerSlug?: string) {
  revalidatePath("/");

  for (const locale of locales) {
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/business`);
    revalidatePath(`/${locale}/providers`);
    revalidatePath(`/${locale}/businesses`);
    revalidatePath(`/${locale}/join`);
    revalidatePath(`/${locale}/admin`);
    revalidatePath(`/${locale}/admin/providers`);
    revalidatePath(`/${locale}/provider`);

    if (providerSlug) {
      revalidatePath(`/${locale}/providers/${providerSlug}`);
      revalidatePath(`/${locale}/book/${providerSlug}`);
    }
  }
}
