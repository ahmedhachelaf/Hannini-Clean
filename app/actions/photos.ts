"use server";

import { getAuthenticatedProvider } from "@/lib/provider-auth";
import { createServerSupabaseClient, hasSupabaseServerEnv } from "@/lib/supabase/server";

const BUCKET = "provider-photos";
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export type PhotoUploadResult =
  | { ok: true; url: string; storagePath: string }
  | { ok: false; error: string };

export type PhotoDeleteResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Upload a single photo for the authenticated provider.
 * Called from the client via a server action with FormData.
 */
export async function uploadProviderPhoto(formData: FormData): Promise<PhotoUploadResult> {
  const provider = await getAuthenticatedProvider();
  if (!provider) {
    return { ok: false, error: "Unauthorized" };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, error: "No file provided" };
  }

  if (!ALLOWED_MIME.has(file.type)) {
    return { ok: false, error: "Invalid file type. Use JPEG, PNG, WebP or GIF." };
  }

  if (file.size > MAX_SIZE_BYTES) {
    return { ok: false, error: "File exceeds the 5 MB limit." };
  }

  if (!hasSupabaseServerEnv()) {
    return { ok: false, error: "Storage is not configured in this environment." };
  }

  const supabase = createServerSupabaseClient();
  if (!supabase) {
    return { ok: false, error: "Could not connect to storage." };
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const storagePath = `${provider.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return { ok: false, error: uploadError.message };
  }

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

  // Record in provider_photos table
  const { error: dbError } = await supabase.from("provider_photos").insert({
    provider_id: provider.id,
    url: urlData.publicUrl,
    storage_path: storagePath,
    is_approved: false, // admin must approve before it appears publicly
    sort_order: 0,
  });

  if (dbError) {
    // Best-effort cleanup of storage file
    await supabase.storage.from(BUCKET).remove([storagePath]);
    return { ok: false, error: dbError.message };
  }

  return { ok: true, url: urlData.publicUrl, storagePath };
}

/**
 * Delete a provider photo by its storage path.
 * Only the owning provider may delete their own photos.
 */
export async function deleteProviderPhoto(storagePath: string): Promise<PhotoDeleteResult> {
  const provider = await getAuthenticatedProvider();
  if (!provider) {
    return { ok: false, error: "Unauthorized" };
  }

  // Ensure the path belongs to this provider (path starts with providerId/)
  if (!storagePath.startsWith(`${provider.id}/`)) {
    return { ok: false, error: "Forbidden" };
  }

  if (!hasSupabaseServerEnv()) {
    return { ok: false, error: "Storage is not configured in this environment." };
  }

  const supabase = createServerSupabaseClient();
  if (!supabase) {
    return { ok: false, error: "Could not connect to storage." };
  }

  const { error: storageError } = await supabase.storage.from(BUCKET).remove([storagePath]);
  if (storageError) {
    return { ok: false, error: storageError.message };
  }

  await supabase.from("provider_photos").delete().eq("storage_path", storagePath).eq("provider_id", provider.id);

  return { ok: true };
}
