import { NextResponse } from "next/server";
import { createServerSupabaseClient, hasSupabaseServerEnv } from "@/lib/supabase/server";
import { createDemoSupportCase } from "@/lib/support-store";
import { supportCaseSchema } from "@/lib/validation";

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
      subject: String(formData.get("subject") ?? ""),
      message: String(formData.get("message") ?? ""),
      phoneNumber: String(formData.get("phoneNumber") ?? ""),
      email: String(formData.get("email") ?? ""),
      bookingId: String(formData.get("bookingId") ?? ""),
      providerId: String(formData.get("providerId") ?? ""),
      providerSlug: String(formData.get("providerSlug") ?? ""),
      attachmentNames,
    });

    if (!hasSupabaseServerEnv()) {
      const supportCase = createDemoSupportCase({
        actorRole: payload.actorRole,
        category: payload.category,
        status: "open",
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

    const { data: supportCase, error } = await supabase
      .from("support_cases")
      .insert({
        actor_role: payload.actorRole,
        issue_category: payload.category,
        status: "open",
        subject: payload.subject,
        message: payload.message,
        phone_number: payload.phoneNumber || null,
        email: payload.email || null,
        booking_id: payload.bookingId || null,
        provider_id: payload.providerId || null,
        provider_slug: payload.providerSlug || null,
        attachment_names: payload.attachmentNames,
      })
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    await supabase.from("support_messages").insert({
      support_case_id: supportCase.id,
      author_role: payload.actorRole,
      author_name: payload.actorRole === "provider" ? "Provider" : "Customer",
      message: payload.message,
      attachment_names: payload.attachmentNames,
    });

    return NextResponse.json({
      ok: true,
      caseId: supportCase.id,
      message: "Support case created successfully.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Unable to create support case.",
      },
      { status: 400 },
    );
  }
}
