import { NextResponse } from "next/server";
import { createServerSupabaseClient, hasSupabaseServerEnv } from "@/lib/supabase/server";
import { createDemoSupportCase } from "@/lib/support-store";
import { revalidatePath } from "next/cache";
import { supportCaseSchema } from "@/lib/validation";

/** Reject any non-UUID string so Postgres never receives an invalid UUID. */
function parseUuidOrNull(value: string): string | null {
  if (!value || !value.trim()) return null;
  const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRe.test(value.trim()) ? value.trim() : null;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const attachmentNames = formData
      .getAll("attachments")
      .filter((value): value is File => value instanceof File && value.size > 0)
      .map((file) => file.name);

    const payload = supportCaseSchema.parse({
      actorRole: String(formData.get("actorRole") ?? ""),
      category: String(formData.get("category") ?? ""),
      requestSafetyBlock: String(formData.get("requestSafetyBlock") ?? "") === "on",
      privacySensitive: String(formData.get("privacySensitive") ?? "") === "on",
      subject: String(formData.get("subject") ?? ""),
      message: String(formData.get("message") ?? ""),
      phoneNumber: String(formData.get("phoneNumber") ?? ""),
      email: String(formData.get("email") ?? ""),
      bookingId: String(formData.get("bookingId") ?? ""),
      providerId: String(formData.get("providerId") ?? ""),
      providerSlug: String(formData.get("providerSlug") ?? ""),
      attachmentNames,
    });

    const legacyTaggedMessage = `${payload.requestSafetyBlock ? "[request_safety_block]" : ""}${payload.privacySensitive ? "[privacy_sensitive]" : ""}${payload.message}`;

    if (!hasSupabaseServerEnv()) {
      const supportCase = createDemoSupportCase({
        actorRole: payload.actorRole,
        category: payload.category,
        status: "open",
        requestSafetyBlock: payload.requestSafetyBlock,
        privacySensitive: payload.privacySensitive,
        subject: payload.subject,
        message: payload.message,
        phoneNumber: payload.phoneNumber || undefined,
        email: payload.email || undefined,
        bookingId: payload.bookingId || undefined,
        providerId: payload.providerId || undefined,
        providerSlug: payload.providerSlug || undefined,
        attachmentNames: payload.attachmentNames,
      });

      return NextResponse.json({
        ok: true,
        demoMode: true,
        caseId: supportCase.id,
        message: "Support case created in demo mode.",
      });
    }

    const supabase = createServerSupabaseClient();

    if (!supabase) {
      throw new Error("Supabase client is not available.");
    }

    // Validate UUIDs before hitting the database — non-UUID text in a uuid column
    // causes a PostgreSQL type error that surfaces as the generic "Unable to create
    // support case." message.
    const bookingUuid = parseUuidOrNull(payload.bookingId);
    const providerUuid = parseUuidOrNull(payload.providerId);

    let { data: supportCase, error } = await supabase
      .from("support_cases")
      .insert({
        actor_role: payload.actorRole,
        issue_category: payload.category,
        status: "open",
        request_safety_block: payload.requestSafetyBlock,
        privacy_sensitive: payload.privacySensitive,
        subject: payload.subject,
        message: payload.message,
        phone_number: payload.phoneNumber || null,
        email: payload.email || null,
        booking_id: bookingUuid,
        provider_id: providerUuid,
        provider_slug: payload.providerSlug || null,
        attachment_names: payload.attachmentNames,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[support] primary insert error:", error.message, error.details, error.hint);

      const fallbackInsert = await supabase
        .from("support_cases")
        .insert({
          actor_role: payload.actorRole,
          issue_category: payload.category,
          status: "open",
          subject: payload.subject,
          message: legacyTaggedMessage,
          phone_number: payload.phoneNumber || null,
          email: payload.email || null,
          booking_id: bookingUuid,
          provider_id: providerUuid,
          provider_slug: payload.providerSlug || null,
          attachment_names: payload.attachmentNames,
        })
        .select("id")
        .single();

      supportCase = fallbackInsert.data;
      error = fallbackInsert.error;

      if (fallbackInsert.error) {
        console.error("[support] fallback insert error:", fallbackInsert.error.message, fallbackInsert.error.details);
      }
    }

    if (error || !supportCase) {
      // Convert PostgrestError to a real Error so the catch block can propagate it.
      throw new Error(error?.message ?? "Unable to create support case.");
    }

    // Non-fatal: insert initial message into the support thread. If this fails we
    // still return success — the case was created and that is what matters.
    const { error: msgError } = await supabase.from("support_messages").insert({
      support_case_id: supportCase.id,
      author_role: payload.actorRole,
      author_name: payload.actorRole === "provider" ? "Provider" : "Customer",
      message: payload.message,
      attachment_names: payload.attachmentNames,
    });
    if (msgError) {
      console.warn("[support] initial message insert failed (non-fatal):", msgError.message);
    }

    revalidatePath("/ar/admin");
    revalidatePath("/fr/admin");
    revalidatePath("/ar/support");
    revalidatePath("/fr/support");

    return NextResponse.json({
      ok: true,
      caseId: supportCase.id,
      message: "Support case created successfully.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "insert_failed";
    console.error("[support] route error:", message);
    return NextResponse.json(
      {
        ok: false,
        message,
        code: "insert_failed",
      },
      { status: 400 },
    );
  }
}
