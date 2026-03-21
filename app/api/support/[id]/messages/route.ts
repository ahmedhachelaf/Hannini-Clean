import { NextResponse } from "next/server";
import { createServerSupabaseClient, hasSupabaseServerEnv } from "@/lib/supabase/server";
import { appendDemoSupportMessage } from "@/lib/support-store";
import { supportReplySchema } from "@/lib/validation";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const formData = await request.formData();
    const attachmentNames = formData
      .getAll("attachments")
      .filter((value): value is File => value instanceof File && value.size > 0)
      .map((file) => file.name);

    const payload = supportReplySchema.parse({
      caseId: id,
      authorRole: String(formData.get("authorRole") ?? ""),
      authorName: String(formData.get("authorName") ?? ""),
      message: String(formData.get("message") ?? ""),
      attachmentNames,
    });

    if (!hasSupabaseServerEnv()) {
      const supportCase = appendDemoSupportMessage(id, {
        authorRole: payload.authorRole,
        authorName: payload.authorName,
        message: payload.message,
        attachmentNames: payload.attachmentNames,
      });

      if (!supportCase) {
        return NextResponse.json({ ok: false, message: "Support case not found." }, { status: 404 });
      }

      return NextResponse.json({ ok: true, demoMode: true, message: "Reply added in demo mode." });
    }

    const supabase = createServerSupabaseClient();

    if (!supabase) {
      throw new Error("Supabase client is not available.");
    }

    const { error } = await supabase.from("support_messages").insert({
      support_case_id: payload.caseId,
      author_role: payload.authorRole,
      author_name: payload.authorName,
      message: payload.message,
      attachment_names: payload.attachmentNames,
    });

    if (error) {
      throw error;
    }

    await supabase.from("support_cases").update({ updated_at: new Date().toISOString() }).eq("id", payload.caseId);

    return NextResponse.json({ ok: true, message: "Reply saved successfully." });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Unable to save reply.",
      },
      { status: 400 },
    );
  }
}
