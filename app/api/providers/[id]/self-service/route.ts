import { NextResponse } from "next/server";
import { getProviderById } from "@/lib/repository";
import { mergeProviderLifecycleNotes, parseProviderLifecycleMeta } from "@/lib/provider-lifecycle";
import { createProviderPasswordSecret } from "@/lib/provider-password";
import { updateDemoProviderSelfService } from "@/lib/provider-store";
import { revalidateMarketplacePaths } from "@/lib/revalidation";
import { createServerSupabaseClient, hasSupabaseServerEnv } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as
    | {
        token?: string;
        action?: "update" | "deactivate" | "reactivate" | "request_deletion";
        workshopName?: string;
        phoneNumber?: string;
        whatsappNumber?: string;
        shortDescription?: string;
        zoneSlug?: string;
        newPassword?: string;
      }
    | null;

  if (!body?.token || !body.action) {
    return NextResponse.json({ ok: false, message: "Missing management token or action." }, { status: 400 });
  }

  if (!hasSupabaseServerEnv()) {
    const provider = updateDemoProviderSelfService(id, body.token, {
      action: body.action,
      workshopName: body.workshopName,
      phoneNumber: body.phoneNumber,
      whatsappNumber: body.whatsappNumber,
      shortDescription: body.shortDescription,
      zoneSlug: body.zoneSlug,
      newPassword: body.newPassword,
    });

    if (!provider) {
      return NextResponse.json({ ok: false, message: "Invalid access or provider not found." }, { status: 404 });
    }

    revalidateMarketplacePaths(provider.slug);

    return NextResponse.json({
      ok: true,
      message:
        body.action === "update"
          ? "Profile updated."
          : body.action === "deactivate"
            ? "Listing paused."
            : body.action === "reactivate"
              ? "Listing reactivated."
              : "Deletion request recorded.",
    });
  }

  const provider = await getProviderById(id, true);

  if (!provider || provider.verification.managementToken !== body.token) {
    return NextResponse.json({ ok: false, message: "Invalid access or provider not found." }, { status: 404 });
  }

  const supabase = createServerSupabaseClient();

  if (!supabase) {
    return NextResponse.json({ ok: false, message: "Supabase unavailable." }, { status: 500 });
  }

  if (body.action === "update") {
    const providerUpdate = await supabase
      .from("providers")
      .update({
        workshop_name: body.workshopName?.trim() || provider.workshopName || null,
        phone_number: body.phoneNumber?.trim() || provider.phoneNumber,
        whatsapp_number: body.whatsappNumber?.trim() || provider.whatsappNumber,
        bio_ar: body.shortDescription?.trim() || provider.bio.ar,
        bio_fr: body.shortDescription?.trim() || provider.bio.fr,
      })
      .eq("id", id);

    if (providerUpdate.error) {
      return NextResponse.json({ ok: false, message: providerUpdate.error.message }, { status: 400 });
    }

    if (body.zoneSlug?.trim()) {
      const deleteAreas = await supabase.from("service_areas").delete().eq("provider_id", id);

      if (deleteAreas.error) {
        return NextResponse.json({ ok: false, message: deleteAreas.error.message }, { status: 400 });
      }

      const addArea = await supabase.from("service_areas").insert({
        provider_id: id,
        zone_slug: body.zoneSlug.trim(),
      });

      if (addArea.error) {
        return NextResponse.json({ ok: false, message: addArea.error.message }, { status: 400 });
      }
    }
  }

  const { data: existingVerification } = await supabase
    .from("provider_verifications")
    .select("document_name, notes, status")
    .eq("provider_id", id)
    .maybeSingle();

  const meta = parseProviderLifecycleMeta(existingVerification?.notes);
  const passwordSecret = body.newPassword?.trim() ? createProviderPasswordSecret(body.newPassword.trim()) : null;
  const statusOverride =
    body.action === "deactivate"
      ? "deactivated_by_provider"
      : body.action === "request_deletion"
        ? "pending_deletion"
        : body.action === "reactivate"
          ? null
          : meta.statusOverride;

  const providerPatch =
    body.action === "deactivate" || body.action === "request_deletion"
      ? { approval_status: "pending" }
      : body.action === "reactivate"
        ? { approval_status: "approved" }
        : null;

  if (providerPatch) {
    const providerUpdate = await supabase.from("providers").update(providerPatch).eq("id", id);

    if (providerUpdate.error) {
      return NextResponse.json({ ok: false, message: providerUpdate.error.message }, { status: 400 });
    }
  }

  const verificationUpdate = await supabase.from("provider_verifications").upsert(
    {
      provider_id: id,
      document_name: existingVerification?.document_name ?? null,
      status: existingVerification?.status ?? "pending",
      notes: mergeProviderLifecycleNotes(existingVerification?.notes ?? null, {
        ageConfirmed: meta.ageConfirmed,
        conductAccepted: meta.conductAccepted,
        policyAccepted: meta.policyAccepted,
        acceptedAt: meta.acceptedAt,
        conductVersion: meta.conductVersion,
        policyVersion: meta.policyVersion,
        managementToken: meta.managementToken,
        passwordSalt: passwordSecret?.salt ?? meta.passwordSalt,
        passwordHash: passwordSecret?.hash ?? meta.passwordHash,
        statusOverride,
      }),
    },
    { onConflict: "provider_id" },
  );

  if (verificationUpdate.error) {
    return NextResponse.json({ ok: false, message: verificationUpdate.error.message }, { status: 400 });
  }

  revalidateMarketplacePaths(provider.slug);

  return NextResponse.json({
    ok: true,
    message:
      body.action === "update"
        ? "Profile updated."
        : body.action === "deactivate"
          ? "Listing paused."
          : body.action === "reactivate"
            ? "Listing reactivated."
            : "Deletion request recorded.",
  });
}
