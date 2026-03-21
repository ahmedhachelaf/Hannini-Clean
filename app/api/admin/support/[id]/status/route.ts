import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createServerSupabaseClient, hasSupabaseServerEnv } from "@/lib/supabase/server";
import { appendDemoSupportMessage, updateDemoSupportStatus } from "@/lib/support-store";
import { supportReplySchema } from "@/lib/validation";
import { z } from "zod";

const supportStatusSchema = z.object({
  status: z.enum(["open", "in_review", "waiting_for_user", "resolved"]),
  replyMessage: z.string().optional().default(""),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const formData = await request.formData();
    const attachmentNames = formData
      .getAll("attachments")
      .filter((value): value is File => value instanceof File && value.size > 0)
      .map((file) => file.name);
    const payload = supportStatusSchema.parse({
      status: String(formData.get("status") ?? ""),
      replyMessage: String(formData.get("replyMessage") ?? ""),
    });

    if (!hasSupabaseServerEnv()) {
      const supportCase = updateDemoSupportStatus(id, payload.status);

      if (!supportCase) {
        return NextResponse.json({ ok: false, message: "Support case not found." }, { status: 404 });
      }

      if (payload.replyMessage.trim()) {
        appendDemoSupportMessage(id, {
          authorRole: "admin",
          authorName: "Henini Admin",
          message: payload.replyMessage.trim(),
          attachmentNames,
        });
      }

      return NextResponse.json({ ok: true, demoMode: true, message: "Support case updated in demo mode." });
    }

    const supabase = createServerSupabaseClient();

    if (!supabase) {
      throw new Error("Supabase client is not available.");
    }

    const { error } = await supabase
      .from("support_cases")
      .update({ status: payload.status, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      throw error;
    }

    if (payload.replyMessage.trim()) {
      const replyPayload = supportReplySchema.parse({
        caseId: id,
        authorRole: "admin",
        authorName: "Henini Admin",
        message: payload.replyMessage.trim(),
        attachmentNames,
      });

      const { error: replyError } = await supabase.from("support_messages").insert({
        support_case_id: replyPayload.caseId,
        author_role: replyPayload.authorRole,
        author_name: replyPayload.authorName,
        message: replyPayload.message,
        attachment_names: replyPayload.attachmentNames,
      });

      if (replyError) {
        throw replyError;
      }
    }

    return NextResponse.json({ ok: true, message: "Support case updated." });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Unable to update support case.",
      },
      { status: 400 },
    );
  }
}
