import type { ProviderStatus } from "@/lib/types";
import { mergeProviderLifecycleNotes, parseProviderLifecycleMeta } from "@/lib/provider-lifecycle";
import { updateDemoProviderModeration } from "@/lib/provider-store";
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
  adminNote?: string;
  rejectionReason?: string;
};

export async function updateProviderModeration({
  providerId,
  approvalStatus,
  isVerified,
  verification,
  adminNote,
  rejectionReason,
}: ModerationUpdateInput) {
  if (!hasSupabaseServerEnv()) {
    const provider = updateDemoProviderModeration(providerId, {
      status: approvalStatus,
      isVerified,
      verificationStatus: verification?.status,
      adminNote,
      rejectionReason,
    });

    if (!provider) {
      return { ok: false as const, message: "Provider not found." };
    }

    revalidateMarketplacePaths(provider.slug);
    return { ok: true as const, demoMode: true as const, slug: provider.slug };
  }

  const supabase = createServerSupabaseClient();

  if (!supabase) {
    return { ok: false as const, message: "Supabase unavailable." };
  }

  const { data: providerRow, error: providerLookupError } = await supabase
    .from("providers")
    .select("id, slug, approval_status, is_verified, phone_verified, email_verified, provider_verifications ( notes )")
    .eq("id", providerId)
    .single();

  if (providerLookupError || !providerRow) {
    console.error("provider-moderation:provider_lookup_failed", {
      providerId,
      approvalStatus,
      verificationStatus: verification?.status,
      error: providerLookupError,
    });
    return { ok: false as const, message: providerLookupError?.message ?? "Provider not found." };
  }

  const verificationMeta = parseProviderLifecycleMeta(providerRow.provider_verifications?.[0]?.notes);
  const isContactVerified = Boolean(
    providerRow.phone_verified ||
      providerRow.email_verified ||
      verificationMeta.phoneVerified ||
      verificationMeta.emailVerified,
  );

  if (verification?.status === "verified" && !isContactVerified) {
    console.error("provider-moderation:contact_not_verified", {
      providerId,
      approvalStatus,
      phoneVerified: providerRow.phone_verified,
      emailVerified: providerRow.email_verified,
    });
    return {
      ok: false as const,
      message: "Provider contact must be verified before admin approval.",
    };
  }

  const providerPatch: Record<string, unknown> = {};
  const dbApprovalStatus =
    approvalStatus === "approved" ||
    approvalStatus === "rejected" ||
    approvalStatus === "needs_more_info"
      ? approvalStatus
      : approvalStatus === "submitted" || approvalStatus === "under_review"
        ? "pending"
        : undefined;

  if (dbApprovalStatus) {
    providerPatch.approval_status = dbApprovalStatus;
  }

  if (typeof isVerified === "boolean") {
    providerPatch.is_verified = isVerified;
  }

  if (verification?.status) {
    providerPatch.verification_status = verification.status;
    if (verification.status === "verified") {
      providerPatch.verified_at = new Date().toISOString();
      providerPatch.verified_by_admin_id = "admin";
    }
  }

  if (Object.keys(providerPatch).length > 0) {
    const providerUpdate = await supabase.from("providers").update(providerPatch).eq("id", providerId);

    if (providerUpdate.error) {
      console.error("provider-moderation:provider_update_failed", {
        providerId,
        approvalStatus,
        verificationStatus: verification?.status,
        patch: providerPatch,
        error: providerUpdate.error,
      });
      return { ok: false as const, message: providerUpdate.error.message };
    }
  }

  if (verification) {
    const { data: existingVerification } = await supabase
      .from("provider_verifications")
      .select("document_name, notes, status")
      .eq("provider_id", providerId)
      .maybeSingle();

    const currentMeta = parseProviderLifecycleMeta(existingVerification?.notes);
    const nextApprovalStatus =
      approvalStatus === "submitted" || approvalStatus === "under_review"
        ? "under_review"
        : approvalStatus;

    const verificationUpdate = await supabase.from("provider_verifications").upsert(
      {
        provider_id: providerId,
        document_name: existingVerification?.document_name ?? null,
        status: verification.status ?? existingVerification?.status ?? "pending",
        notes: mergeProviderLifecycleNotes(
          verification.notes ?? existingVerification?.notes ?? null,
          {
            ageConfirmed: currentMeta.ageConfirmed,
            conductAccepted: currentMeta.conductAccepted,
            policyAccepted: currentMeta.policyAccepted,
            acceptedAt: currentMeta.acceptedAt,
            conductVersion: currentMeta.conductVersion,
            policyVersion: currentMeta.policyVersion,
            managementToken: currentMeta.managementToken,
            statusOverride:
              nextApprovalStatus && nextApprovalStatus !== "approved" && nextApprovalStatus !== "rejected"
                ? nextApprovalStatus
                : null,
            adminNote,
            rejectionReason,
          },
        ),
      },
      { onConflict: "provider_id" },
    );

    if (verificationUpdate.error) {
      console.error("provider-moderation:verification_upsert_failed", {
        providerId,
        approvalStatus,
        verificationStatus: verification.status,
        error: verificationUpdate.error,
      });
      return { ok: false as const, message: verificationUpdate.error.message };
    }

    if (verification.status === "verified") {
      const notificationInsert = await supabase.from("notifications").insert({
        provider_id: providerId,
        type: "verification_approved",
        title_ar: "تم قبول طلبك",
        body_ar: "تم قبول طلبك ويمكنك الآن استقبال الطلبات",
        title_fr: "Votre demande a été acceptée",
        body_fr: "Votre demande a été acceptée et vous pouvez maintenant recevoir des demandes.",
      });

      if (notificationInsert.error) {
        console.error("provider-moderation:verification_notification_failed", {
          providerId,
          status: verification.status,
          error: notificationInsert.error,
        });
      }
    }

    if (verification.status === "rejected") {
      const notificationInsert = await supabase.from("notifications").insert({
        provider_id: providerId,
        type: "verification_rejected",
        title_ar: "تم رفض طلب التحقق",
        body_ar: rejectionReason
          ? `سبب الرفض: ${rejectionReason}`
          : "نأسف، لم يتم قبول الطلب حالياً. يمكنك تحديث بياناتك ثم إعادة المحاولة.",
        title_fr: "Demande refusée",
        body_fr: rejectionReason
          ? `Motif: ${rejectionReason}`
          : "Votre demande n’a pas été acceptée pour le moment. Mettez à jour votre profil puis réessayez.",
      });

      if (notificationInsert.error) {
        console.error("provider-moderation:verification_notification_failed", {
          providerId,
          status: verification.status,
          error: notificationInsert.error,
        });
      }
    }
  }

  if (!verification && (adminNote || rejectionReason)) {
    const { data: existingVerification } = await supabase
      .from("provider_verifications")
      .select("document_name, notes, status")
      .eq("provider_id", providerId)
      .maybeSingle();

    const currentMeta = parseProviderLifecycleMeta(existingVerification?.notes);
    const verificationUpdate = await supabase.from("provider_verifications").upsert(
      {
        provider_id: providerId,
        document_name: existingVerification?.document_name ?? null,
        status: existingVerification?.status ?? "pending",
        notes: mergeProviderLifecycleNotes(existingVerification?.notes ?? null, {
          ageConfirmed: currentMeta.ageConfirmed,
          conductAccepted: currentMeta.conductAccepted,
          policyAccepted: currentMeta.policyAccepted,
          acceptedAt: currentMeta.acceptedAt,
          conductVersion: currentMeta.conductVersion,
          policyVersion: currentMeta.policyVersion,
          managementToken: currentMeta.managementToken,
          statusOverride:
            approvalStatus && approvalStatus !== "approved" && approvalStatus !== "rejected"
              ? approvalStatus
              : null,
          adminNote,
          rejectionReason,
        }),
      },
      { onConflict: "provider_id" },
    );

    if (verificationUpdate.error) {
      console.error("provider-moderation:verification_note_upsert_failed", {
        providerId,
        approvalStatus,
        error: verificationUpdate.error,
      });
      return { ok: false as const, message: verificationUpdate.error.message };
    }
  }

  revalidateMarketplacePaths(providerRow.slug);

  return { ok: true as const, slug: providerRow.slug };
}
