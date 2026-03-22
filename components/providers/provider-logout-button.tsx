"use client";

type ProviderLogoutButtonProps = {
  locale: "ar" | "fr";
};

export function ProviderLogoutButton({ locale }: ProviderLogoutButtonProps) {
  async function handleLogout() {
    await fetch("/api/provider/logout", { method: "POST" });
    window.location.href = `/${locale}/provider/login`;
  }

  return (
    <button type="button" className="button-secondary" onClick={handleLogout}>
      {locale === "ar" ? "خروج" : "Déconnexion"}
    </button>
  );
}
