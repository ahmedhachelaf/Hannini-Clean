"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Locale } from "@/lib/types";

type MetadataManagerProps = {
  locale: Locale;
  labels: {
    addCategory: string;
    addZone: string;
  };
};

export function MetadataManager({ locale, labels }: MetadataManagerProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");

  async function submitCategory(formData: FormData) {
    const payload = {
      type: "category",
      slug: String(formData.get("slug") ?? ""),
      nameAr: String(formData.get("nameAr") ?? ""),
      nameFr: String(formData.get("nameFr") ?? ""),
      icon: String(formData.get("icon") ?? ""),
    };

    const response = await fetch("/api/admin/metadata", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as { ok: boolean; message: string };
    setMessage(data.message);
    router.refresh();
  }

  async function submitZone(formData: FormData) {
    const payload = {
      type: "zone",
      slug: String(formData.get("slug") ?? ""),
      nameAr: String(formData.get("nameAr") ?? ""),
      nameFr: String(formData.get("nameFr") ?? ""),
      wilaya: String(formData.get("wilaya") ?? ""),
    };

    const response = await fetch("/api/admin/metadata", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as { ok: boolean; message: string };
    setMessage(data.message);
    router.refresh();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <form action={submitCategory} className="rounded-[1.5rem] border border-[var(--line)] bg-white p-4">
        <h3 className="text-base font-bold">{labels.addCategory}</h3>
        <div className="mt-4 grid gap-3">
          <input name="slug" required className="input-base" placeholder={locale === "ar" ? "slug" : "slug"} />
          <input name="nameAr" required className="input-base" placeholder={locale === "ar" ? "الاسم بالعربية" : "Nom arabe"} />
          <input name="nameFr" required className="input-base" placeholder={locale === "ar" ? "الاسم بالفرنسية" : "Nom français"} />
          <input name="icon" className="input-base" placeholder={locale === "ar" ? "أيقونة الفئة (اختياري)" : "Icône de la catégorie (optionnel)"} />
          <button type="submit" className="button-primary w-full">
            {labels.addCategory}
          </button>
        </div>
      </form>

      <form action={submitZone} className="rounded-[1.5rem] border border-[var(--line)] bg-white p-4">
        <h3 className="text-base font-bold">{labels.addZone}</h3>
        <div className="mt-4 grid gap-3">
          <input name="slug" required className="input-base" placeholder="slug" />
          <input name="nameAr" required className="input-base" placeholder={locale === "ar" ? "الاسم بالعربية" : "Nom arabe"} />
          <input name="nameFr" required className="input-base" placeholder={locale === "ar" ? "الاسم بالفرنسية" : "Nom français"} />
          <input name="wilaya" required defaultValue="Oran" className="input-base" placeholder="Wilaya" />
          <button type="submit" className="button-primary w-full">
            {labels.addZone}
          </button>
        </div>
      </form>

      {message ? <p className="text-sm text-[var(--muted)] lg:col-span-2">{message}</p> : null}
    </div>
  );
}
