"use client";

import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/types";

type LogoutButtonProps = {
  locale: Locale;
  label: string;
};

export function LogoutButton({ locale, label }: LogoutButtonProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push(`/${locale}/admin/login`);
    router.refresh();
  }

  return (
    <button type="button" onClick={handleLogout} className="button-secondary">
      {label}
    </button>
  );
}
