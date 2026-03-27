"use client";

import { useMemo, useState } from "react";
import type { Locale, Provider, Zone } from "@/lib/types";

type ProviderSelfServiceFormProps = {
  locale: Locale;
  provider: Provider;
  token?: string;
  zones: Zone[];
};

export function ProviderSelfServiceForm({ locale, provider, token, zones }: ProviderSelfServiceFormProps) {
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const [workshopName, setWorkshopName] = useState(provider.workshopName ?? "");
  const [email, setEmail] = useState(provider.email ?? "");
  const [phoneNumber, setPhoneNumber] = useState(provider.phoneNumber);
  const [whatsappNumber, setWhatsappNumber] = useState(provider.whatsappNumber);
  const [shortDescription, setShortDescription] = useState(provider.bio[locale]);
  const [zoneSlug, setZoneSlug] = useState(provider.zones[0] ?? zones[0]?.slug ?? "");
  const [provinceSlug, setProvinceSlug] = useState(
    zones.find((zone) => zone.slug === (provider.zones[0] ?? ""))?.provinceSlug ?? zones[0]?.provinceSlug ?? "",
  );
  const [provinceQuery, setProvinceQuery] = useState("");
  const [zoneQuery, setZoneQuery] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const canReactivate = provider.status === "deactivated_by_provider";
  const canRequestDeletion = provider.status !== "pending_deletion" && provider.status !== "deleted";

  const provinces = useMemo(
    () =>
      Array.from(new Map(zones.map((zone) => [zone.provinceSlug, zone.provinceName])).entries()).map(([slug, name]) => ({
        slug,
        name,
      })),
    [zones],
  );
  const filteredProvinces = useMemo(
    () =>
      provinces.filter((province) => {
        if (!provinceQuery.trim()) return true;
        const name = province.name[locale]?.toLowerCase() ?? "";
        return name.includes(provinceQuery.trim().toLowerCase());
      }),
    [provinces, provinceQuery, locale],
  );
  const provinceZones = useMemo(
    () => zones.filter((zone) => zone.provinceSlug === provinceSlug),
    [zones, provinceSlug],
  );
  const filteredZones = useMemo(
    () =>
      provinceZones.filter((zone) => {
        if (!zoneQuery.trim()) return true;
        const name = zone.name[locale]?.toLowerCase() ?? "";
        return name.includes(zoneQuery.trim().toLowerCase());
      }),
    [provinceZones, zoneQuery, locale],
  );

  async function run(action: "update" | "deactivate" | "reactivate" | "request_deletion") {
    setPending(action);
    setMessage("");
    setIsError(false);

    if (action === "update" && newPassword && newPassword !== confirmPassword) {
      setIsError(true);
      setMessage(locale === "ar" ? "تأكيد كلمة المرور غير مطابق." : "La confirmation du mot de passe ne correspond pas.");
      return;
    }

    try {
      const response = await fetch(`/api/providers/${provider.id}/self-service`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: token || undefined,
          action,
          workshopName,
          email,
          phoneNumber,
          whatsappNumber,
          shortDescription,
          zoneSlug,
          newPassword,
        }),
      });

      const data = (await response.json()) as { ok?: boolean; message?: string };

      if (!response.ok || !data.ok) {
        setIsError(true);
        setMessage(
          data.message ??
            (locale === "ar" ? "تعذر تحديث الملف حالياً." : "Impossible de mettre à jour le profil pour le moment."),
        );
        return;
      }

      setMessage(
        locale === "ar"
          ? action === "update"
            ? "تم حفظ التحديثات بنجاح."
            : action === "deactivate"
              ? "تم إيقاف ظهور الملف مؤقتاً."
              : action === "reactivate"
                ? "تمت إعادة تفعيل الظهور."
                : "تم تسجيل طلب المغادرة للمراجعة."
          : action === "update"
            ? "Les modifications ont bien été enregistrées."
            : action === "deactivate"
              ? "Le profil est maintenant mis en pause."
              : action === "reactivate"
              ? "Le profil est de nouveau actif."
                : "La demande de départ a bien été enregistrée.");
      setNewPassword("");
      setConfirmPassword("");
      window.location.reload();
    } catch {
      setIsError(true);
      setMessage(locale === "ar" ? "تعذر تحديث الملف حالياً." : "Impossible de mettre à jour le profil pour le moment.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="surface-card rounded-[1.75rem] p-6">
      <h1 className={`text-2xl font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>
        {locale === "ar" ? "إدارة ملف مزود الخدمة" : "Gérer votre profil prestataire"}
      </h1>
      <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
        {locale === "ar"
          ? "يمكنك تحديث معلوماتك، إيقاف الظهور مؤقتاً، أو طلب مغادرة المنصة مع الحفاظ على السجل الإداري عند الحاجة."
          : "Vous pouvez mettre à jour vos informations, mettre votre visibilité en pause ou demander votre départ tout en gardant l'historique administratif nécessaire."}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label>
          <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">
            {locale === "ar" ? "اسم النشاط" : "Nom de l'activité"}
          </span>
          <input value={workshopName} onChange={(event) => setWorkshopName(event.target.value)} className="input-base" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">
            {locale === "ar" ? "البريد الإلكتروني" : "E-mail"}
          </span>
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" className="input-base" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">
            {locale === "ar" ? "الهاتف" : "Téléphone"}
          </span>
          <input value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} className="input-base" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">
            {locale === "ar" ? "واتساب" : "WhatsApp"}
          </span>
          <input value={whatsappNumber} onChange={(event) => setWhatsappNumber(event.target.value)} className="input-base" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">
            {locale === "ar" ? "الولاية" : "Wilaya"}
          </span>
          <input
            type="search"
            value={provinceQuery}
            onChange={(event) => setProvinceQuery(event.target.value)}
            placeholder={locale === "ar" ? "ابحث عن ولاية" : "Chercher une wilaya"}
            className="input-base mb-2"
          />
          <select
            value={provinceSlug}
            onChange={(event) => {
              const next = event.target.value;
              setProvinceSlug(next);
              setZoneQuery("");
              const firstZone = zones.find((zone) => zone.provinceSlug === next)?.slug;
              if (firstZone) setZoneSlug(firstZone);
            }}
            className="input-base"
          >
            {filteredProvinces.map((province) => (
              <option key={province.slug} value={province.slug}>
                {province.name[locale]}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">
            {locale === "ar" ? "المدينة أو المنطقة" : "Ville ou zone"}
          </span>
          <input
            type="search"
            value={zoneQuery}
            onChange={(event) => setZoneQuery(event.target.value)}
            placeholder={locale === "ar" ? "ابحث عن مدينة" : "Chercher une ville"}
            className="input-base mb-2"
          />
          <select value={zoneSlug} onChange={(event) => setZoneSlug(event.target.value)} className="input-base">
            {filteredZones.map((zone) => (
              <option key={zone.slug} value={zone.slug}>
                {zone.name[locale]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="mt-4 block">
        <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">
          {locale === "ar" ? "وصف النشاط" : "Description"}
        </span>
        <textarea
          value={shortDescription}
          onChange={(event) => setShortDescription(event.target.value)}
          rows={4}
          className="input-base min-h-28 resize-y"
        />
      </label>

      <section className="mt-4 rounded-[1.5rem] border border-[rgba(20,92,255,0.12)] bg-[var(--soft)] p-5">
        <h2 className={`text-lg font-extrabold ${locale === "ar" ? "arabic-display" : ""}`}>
          {locale === "ar" ? "حماية الدخول إلى لوحة مزود الخدمة" : "Protection de votre espace prestataire"}
        </h2>
        <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
          {provider.verification.hasPassword
            ? locale === "ar"
              ? "يمكنك تغيير كلمة المرور من هنا في أي وقت."
              : "Vous pouvez changer votre mot de passe ici à tout moment."
            : locale === "ar"
              ? "لم يتم ضبط كلمة مرور بعد. عيّن كلمة مرور الآن حتى يبقى دخولك إلى اللوحة تحت سيطرتك."
              : "Aucun mot de passe n’est encore défini. Choisissez-en un maintenant pour garder votre espace sous votre contrôle."}
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">
              {locale === "ar" ? "كلمة المرور الجديدة" : "Nouveau mot de passe"}
            </span>
            <input value={newPassword} onChange={(event) => setNewPassword(event.target.value)} type="password" className="input-base" />
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">
              {locale === "ar" ? "تأكيد كلمة المرور" : "Confirmer le mot de passe"}
            </span>
            <input value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} type="password" className="input-base" />
          </label>
        </div>
      </section>

      {message ? (
        <div
          role={isError ? "alert" : "status"}
          className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${isError ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}
        >
          {message}
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" disabled={pending !== null} onClick={() => run("update")} className="button-primary disabled:opacity-60">
          {pending === "update" ? (locale === "ar" ? "جارٍ الحفظ..." : "Enregistrement...") : locale === "ar" ? "حفظ التحديثات" : "Enregistrer"}
        </button>
        <button type="button" disabled={pending !== null} onClick={() => run("deactivate")} className="button-secondary disabled:opacity-60">
          {pending === "deactivate" ? (locale === "ar" ? "..." : "...") : locale === "ar" ? "إيقاف الظهور مؤقتاً" : "Mettre en pause"}
        </button>
        <button type="button" disabled={pending !== null || !canReactivate} onClick={() => run("reactivate")} className="button-secondary disabled:opacity-60">
          {pending === "reactivate" ? (locale === "ar" ? "..." : "...") : locale === "ar" ? "إعادة التفعيل" : "Réactiver"}
        </button>
        <button type="button" disabled={pending !== null || !canRequestDeletion} onClick={() => run("request_deletion")} className="rounded-full border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-700 disabled:opacity-60">
          {pending === "request_deletion" ? (locale === "ar" ? "..." : "...") : locale === "ar" ? "طلب مغادرة المنصة" : "Demander la suppression"}
        </button>
      </div>

      {!canReactivate || !canRequestDeletion ? (
        <div className="mt-4 rounded-2xl border border-[var(--line)] bg-[var(--soft)] px-4 py-3 text-sm leading-7 text-[var(--muted)]">
          {!canReactivate
            ? locale === "ar"
              ? "زر إعادة التفعيل يظهر فقط عندما يكون الملف موقوفاً من جهتك."
              : "La réactivation n'est proposée que lorsque le profil a été mis en pause par vous."
            : null}
          {!canRequestDeletion
            ? locale === "ar"
              ? "طلب المغادرة مسجل بالفعل ويظهر الآن ضمن متابعة الإدارة."
              : "La demande de départ est déjà enregistrée et suivie côté admin."
            : null}
        </div>
      ) : null}
    </div>
  );
}
