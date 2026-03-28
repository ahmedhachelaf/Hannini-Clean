import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { isValidAlgerianPhone, normalizeAlgerianPhone } from "@/lib/phone";

const PENDING_COOKIE = "hannini_provider_verification_pending";
const VERIFIED_COOKIE = "hannini_provider_verification_verified";

const VERIFICATION_TTL_SECONDS = 15 * 60;
const VERIFIED_TTL_SECONDS = 60 * 60;
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_VERIFY_ATTEMPTS = 5;

export type ProviderVerificationMethod = "phone" | "email";
export type ProviderPhoneVerificationChannel = "sms" | "whatsapp";
export type ProviderEmailVerificationMode = "magic_link" | "otp";

export type PendingProviderVerification = {
  method: ProviderVerificationMethod;
  target: string;
  channel?: ProviderPhoneVerificationChannel;
  startedAt: string;
  expiresAt: string;
  resendAvailableAt: string;
  attempts: number;
};

export type VerifiedProviderContact = {
  method: ProviderVerificationMethod;
  target: string;
  channel?: ProviderPhoneVerificationChannel;
  authUserId: string;
  verifiedAt: string;
  expiresAt: string;
};

type SignedPayload<T> = T & {
  issuedAt: string;
};

function getVerificationSecret() {
  const secret = process.env.PROVIDER_VERIFICATION_SECRET ?? process.env.PROVIDER_SESSION_SECRET ?? process.env.ADMIN_ACCESS_PASSWORD;

  if (!secret) {
    throw new Error("PROVIDER_VERIFICATION_SECRET (or PROVIDER_SESSION_SECRET / ADMIN_ACCESS_PASSWORD) is not configured.");
  }

  return secret;
}

function signPayload(payload: string) {
  return createHmac("sha256", getVerificationSecret()).update(payload).digest("base64url");
}

function serializeSignedPayload<T extends Record<string, unknown>>(payload: T) {
  const raw = Buffer.from(JSON.stringify({ ...payload, issuedAt: new Date().toISOString() })).toString("base64url");
  return `${raw}.${signPayload(raw)}`;
}

function parseSignedPayload<T>(value: string | undefined): SignedPayload<T> | null {
  if (!value) return null;

  const [raw, signature] = value.split(".");
  if (!raw || !signature) return null;

  const expected = signPayload(raw);
  if (expected.length !== signature.length) return null;
  if (!timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) return null;

  try {
    return JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as SignedPayload<T>;
  } catch {
    return null;
  }
}

function isExpired(iso: string | undefined) {
  if (!iso) return true;
  return Date.parse(iso) <= Date.now();
}

export function normalizeVerificationTarget(method: ProviderVerificationMethod, value: string) {
  const trimmed = value.trim();
  return method === "phone" ? normalizeAlgerianPhone(trimmed) : trimmed.toLowerCase();
}

export function isEmailVerificationAvailable() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) || !process.env.NODE_ENV || process.env.NODE_ENV !== "production";
}

export function getEmailVerificationMode(): ProviderEmailVerificationMode {
  const raw = (process.env.NEXT_PUBLIC_PROVIDER_EMAIL_VERIFICATION_MODE ?? process.env.PROVIDER_EMAIL_VERIFICATION_MODE ?? "magic_link")
    .trim()
    .toLowerCase();

  return raw === "otp" ? "otp" : "magic_link";
}

export function isPhoneVerificationEnabled() {
  return process.env.PROVIDER_PHONE_OTP_ENABLED === "true" || process.env.NEXT_PUBLIC_PROVIDER_PHONE_OTP_ENABLED === "true";
}

export function getEnabledPhoneVerificationChannels(): ProviderPhoneVerificationChannel[] {
  if (!isPhoneVerificationEnabled()) {
    return [];
  }

  const raw = process.env.NEXT_PUBLIC_PROVIDER_PHONE_OTP_CHANNELS ?? process.env.PROVIDER_PHONE_OTP_CHANNELS ?? "sms";
  const channels = raw
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter((value): value is ProviderPhoneVerificationChannel => value === "sms" || value === "whatsapp");

  return channels.length > 0 ? Array.from(new Set(channels)) : ["sms"];
}

export function getDefaultPhoneVerificationChannel(): ProviderPhoneVerificationChannel {
  return getEnabledPhoneVerificationChannels()[0] ?? "sms";
}

export function isPhoneVerificationChannelEnabled(channel: ProviderPhoneVerificationChannel) {
  return getEnabledPhoneVerificationChannels().includes(channel);
}

export function validateVerificationTarget(method: ProviderVerificationMethod, value: string) {
  const normalized = normalizeVerificationTarget(method, value);

  if (method === "phone") {
    return isValidAlgerianPhone(normalized);
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
}

export function createAnonSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function getPendingProviderVerification() {
  const store = await cookies();
  const parsed = parseSignedPayload<PendingProviderVerification>(store.get(PENDING_COOKIE)?.value);

  if (!parsed || isExpired(parsed.expiresAt)) {
    return null;
  }

  return parsed;
}

export async function getVerifiedProviderContact() {
  const store = await cookies();
  const parsed = parseSignedPayload<VerifiedProviderContact>(store.get(VERIFIED_COOKIE)?.value);

  if (!parsed || isExpired(parsed.expiresAt)) {
    return null;
  }

  return parsed;
}

export async function setPendingProviderVerification(input: {
  method: ProviderVerificationMethod;
  target: string;
  channel?: ProviderPhoneVerificationChannel;
  attempts?: number;
}) {
  const now = Date.now();
  const payload: PendingProviderVerification = {
    method: input.method,
    target: normalizeVerificationTarget(input.method, input.target),
    channel: input.method === "phone" ? input.channel ?? "sms" : undefined,
    startedAt: new Date(now).toISOString(),
    expiresAt: new Date(now + VERIFICATION_TTL_SECONDS * 1000).toISOString(),
    resendAvailableAt: new Date(now + RESEND_COOLDOWN_SECONDS * 1000).toISOString(),
    attempts: input.attempts ?? 0,
  };

  const store = await cookies();
  store.set(PENDING_COOKIE, serializeSignedPayload(payload), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: VERIFICATION_TTL_SECONDS,
  });

  return payload;
}

export async function updatePendingProviderVerificationAttempts(attempts: number) {
  const pending = await getPendingProviderVerification();
  if (!pending) {
    return null;
  }

  const store = await cookies();
  const payload: PendingProviderVerification = {
    ...pending,
    attempts,
  };
  store.set(PENDING_COOKIE, serializeSignedPayload(payload), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.max(1, Math.ceil((Date.parse(pending.expiresAt) - Date.now()) / 1000)),
  });

  return payload;
}

export async function setVerifiedProviderContact(input: {
  method: ProviderVerificationMethod;
  target: string;
  channel?: ProviderPhoneVerificationChannel;
  authUserId: string;
}) {
  const now = Date.now();
  const payload: VerifiedProviderContact = {
    method: input.method,
    target: normalizeVerificationTarget(input.method, input.target),
    channel: input.method === "phone" ? input.channel ?? "sms" : undefined,
    authUserId: input.authUserId,
    verifiedAt: new Date(now).toISOString(),
    expiresAt: new Date(now + VERIFIED_TTL_SECONDS * 1000).toISOString(),
  };

  const store = await cookies();
  store.set(VERIFIED_COOKIE, serializeSignedPayload(payload), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: VERIFIED_TTL_SECONDS,
  });

  return payload;
}

export async function clearPendingProviderVerification() {
  const store = await cookies();
  store.delete(PENDING_COOKIE);
}

export async function clearVerifiedProviderContact() {
  const store = await cookies();
  store.delete(VERIFIED_COOKIE);
}

export async function clearProviderVerificationCookies() {
  await clearPendingProviderVerification();
  await clearVerifiedProviderContact();
}

export function getVerificationConstants() {
  return {
    ttlSeconds: VERIFICATION_TTL_SECONDS,
    verifiedTtlSeconds: VERIFIED_TTL_SECONDS,
    resendCooldownSeconds: RESEND_COOLDOWN_SECONDS,
    maxAttempts: MAX_VERIFY_ATTEMPTS,
  };
}

export function getVerificationDeliveryLabel(
  method: ProviderVerificationMethod,
  locale: "ar" | "fr",
  channel: ProviderPhoneVerificationChannel = "sms",
) {
  if (method === "phone") {
    if (channel === "whatsapp") {
      return locale === "ar" ? "واتساب" : "WhatsApp";
    }

    return locale === "ar" ? "رسالة نصية" : "SMS";
  }

  return locale === "ar" ? "البريد الإلكتروني" : "e-mail";
}

export function getVerificationErrorMessage(
  code: "unsupported_phone" | "invalid_target" | "cooldown" | "expired" | "locked" | "missing_pending" | "not_verified",
  locale: "ar" | "fr",
) {
  if (locale === "ar") {
    return {
      unsupported_phone: "التحقق عبر الهاتف غير مفعّل حالياً. استخدم البريد الإلكتروني أو فعّل مزود OTP في Supabase.",
      invalid_target: "تحقق من رقم الهاتف أو البريد الإلكتروني ثم أعد المحاولة.",
      cooldown: "تم إرسال رمز مؤخراً. انتظر قليلاً ثم أعد الإرسال.",
      expired: "انتهت صلاحية الرمز. اطلب رمزاً جديداً.",
      locked: "تم تجاوز عدد المحاولات المسموح. اطلب رمزاً جديداً.",
      missing_pending: "ابدأ خطوة التحقق أولاً قبل إدخال الرمز.",
      not_verified: "أكمل التحقق من الهاتف أو البريد الإلكتروني قبل إرسال الطلب.",
    }[code];
  }

  return {
    unsupported_phone: "La vérification par téléphone n'est pas activée pour le moment. Utilisez l'e-mail ou activez un fournisseur OTP dans Supabase.",
    invalid_target: "Vérifiez le numéro ou l'e-mail puis réessayez.",
    cooldown: "Un code a déjà été envoyé récemment. Merci d'attendre avant de le renvoyer.",
    expired: "Le code a expiré. Demandez-en un nouveau.",
    locked: "Nombre maximum d'essais atteint. Demandez un nouveau code.",
    missing_pending: "Commencez d'abord l'étape de vérification avant de saisir le code.",
    not_verified: "Vérifiez votre téléphone ou votre e-mail avant d'envoyer la demande.",
  }[code];
}
