import { revalidatePath } from "next/cache";
import { locales } from "@/lib/i18n";

export function revalidateMarketplacePaths(providerSlug?: string) {
  revalidatePath("/");

  for (const locale of locales) {
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/providers`);
    revalidatePath(`/${locale}/businesses`);
    revalidatePath(`/${locale}/join`);
    revalidatePath(`/${locale}/admin`);

    if (providerSlug) {
      revalidatePath(`/${locale}/providers/${providerSlug}`);
      revalidatePath(`/${locale}/book/${providerSlug}`);
    }
  }
}
