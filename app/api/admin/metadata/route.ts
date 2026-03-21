import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createServerSupabaseClient, hasSupabaseServerEnv } from "@/lib/supabase/server";
import { metadataSchema } from "@/lib/validation";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  try {
    const payload = metadataSchema.parse(await request.json());

    if (!hasSupabaseServerEnv()) {
      return NextResponse.json({ ok: true, demoMode: true, message: "Saved in demo mode." });
    }

    const supabase = createServerSupabaseClient();

    if (!supabase) {
      throw new Error("Supabase unavailable.");
    }

    if (payload.type === "category") {
      const { error } = await supabase.from("categories").insert({
        slug: payload.slug,
        icon: payload.icon ?? "🧰",
        name_ar: payload.nameAr,
        name_fr: payload.nameFr,
        description_ar: payload.nameAr,
        description_fr: payload.nameFr,
      });

      if (error) {
        throw error;
      }
    } else {
      const { error } = await supabase.from("zones").insert({
        slug: payload.slug,
        province_slug: payload.provinceSlug ?? payload.slug,
        wilaya: payload.wilaya,
        name_ar: payload.nameAr,
        name_fr: payload.nameFr,
      });

      if (error) {
        throw error;
      }
    }

    return NextResponse.json({ ok: true, message: "Saved successfully." });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Unable to save metadata.",
      },
      { status: 400 },
    );
  }
}
