import type { ProviderStatus } from "@/lib/types";
import { revalidateMarketplacePaths } from "@/lib/revalidation";
import { createServerSupabaseClient, hasSupabaseServerEnv } from "@/lib/supabase/server";

type VerificationUpdate = {
  status?: "pending" | "verified" | "rejected";
  notes?: string;
};

type ModerationUpdateInput = {
  providerId: string;
  approvalStatus?: ProviderStatus;
  isVerified?: boolean;
  verification?: VerificationUpdate;
};

export async function updateProviderModeration({
  providerId,
  approvalStatus,
  isVerified,
  verification,
}: ModerationUpdateInput) {
  if (!hasSupabaseServerEnv()) {
    return { ok: true as const, demoMode: true as const, slug: undefined };
  }

  const supabase = createServerSupabaseClient();

  if (!supabase) {
    return { ok: false as const, message: "Supabase unavailable." };
  }

  const { data: providerRow, error: providerLookupError } = await supabase
    .from("providers")
    .select("id, slug, approval_status, is_verified")
    .eq("id", providerId)
    .single();

  if (providerLookupError || !providerRow) {
    return { ok: false as const, message: providerLookupError?.message ?? "Provider not found." };
  }

  const providerPatch: Record<string, unknown> = {};

  if (approvalStatus) {
    providerPatch.approval_status = approvalStatus;
  }

  if (typeof isVerified === "boolean") {
    providerPatch.is_verified = isVerified;
  }

  if (Object.keys(providerPatch).length > 0) {
    const providerUpdate = await supabase.from("providers").update(providerPatch).eq("id", providerId);

    if (providerUpdate.error) {
      return { ok: false as const, message: providerUpdate.error.message };
    }
  }

  if (verification) {
    const { data: existingVerification } = await supabase
      .from("provider_verifications")
      .select("document_name, notes, status")
      .eq("provider_id", providerId)
      .maybeSingle();

    const verificationUpdate = await supabase.from("provider_verifications").upsert(
      {
        provider_id: providerId,
        document_name: existingVerification?.document_name ?? null,
        status: verification.status ?? existingVerification?.status ?? "pending",
        notes: verification.notes ?? existingVerification?.notes ?? null,
      },
      { onConflict: "provider_id" },
    );

    if (verificationUpdate.error) {
      return { ok: false as const, message: verificationUpdate.error.message };
    }
  }

  revalidateMarketplacePaths(providerRow.slug);

  return { ok: true as const, slug: providerRow.slug };
}
