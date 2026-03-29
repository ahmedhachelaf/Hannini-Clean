import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

/*
SUPABASE DASHBOARD CONFIGURATION REQUIRED:
════════════════════════════════════════════

1. Authentication → URL Configuration:
   Site URL: https://your-vercel-url.vercel.app
   Redirect URLs:
   - https://your-vercel-url.vercel.app/**
   - http://localhost:3000/**

2. Authentication → Email Templates:
   The email template must contain {{ .Token }} and not rely on
   {{ .ConfirmationURL }}. Hannini now expects 6-digit email codes,
   not magic links, for the auth flow.

3. Authentication → Sign In / Providers:
   Email provider must be enabled.

4. Authentication → Rate Limits:
   Increase limits temporarily while testing if sends are throttled.

5. Hannini now uses EMAIL-ONLY verification:
   Do not configure or advertise SMS / WhatsApp OTP here unless you
   intentionally decide to bring paid phone infrastructure back later.
*/

const PENDING_COOKIE = "hannini_provider_verification_pending";
const VERIFIED_COOKIE = "hannini_provider_verification_verified";

const VERIFICATION_TTL_SECONDS = 15 * 60;
const VERIFIED_TTL_SECONDS = 60 * 60;
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_VERIFY_ATTEMPTS = 5;

export type ProviderVerificationMethod = "email";
export type ProviderEmailVerificationMode = "otp";

export type PendingProviderVerification = {
  method: ProviderVerificationMethod;
  target: string;
  startedAt: string;
  expiresAt: string;
  resendAvailableAt: string;
  attempts: number;
};

export type VerifiedProviderContact = {
  method: ProviderVerificationMethod;
  target: string;
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
  void method;
  return value.trim().toLowerCase();
}

export function isEmailVerificationAvailable() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) || !process.env.NODE_ENV || process.env.NODE_ENV !== "production";
}

export function getEmailVerificationMode(): ProviderEmailVerificationMode {
  return "otp";
}

export function validateVerificationTarget(method: ProviderVerificationMethod, value: string) {
  void method;
  const normalized = normalizeVerificationTarget("email", value);
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
  attempts?: number;
}) {
  const now = Date.now();
  const payload: PendingProviderVerification = {
    method: input.method,
    target: normalizeVerificationTarget(input.method, input.target),
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
  authUserId: string;
}) {
  const now = Date.now();
  const payload: VerifiedProviderContact = {
    method: input.method,
    target: normalizeVerificationTarget(input.method, input.target),
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

export function getVerificationDeliveryLabel(locale: "ar" | "fr") {
  return locale === "ar" ? "البريد الإلكتروني" : "e-mail";
}

export function getVerificationErrorMessage(
  code: "invalid_target" | "cooldown" | "expired" | "locked" | "missing_pending" | "not_verified",
  locale: "ar" | "fr",
) {
  if (locale === "ar") {
    return {
      invalid_target: "تحقق من البريد الإلكتروني ثم أعد المحاولة.",
      cooldown: "تم إرسال رمز مؤخراً. انتظر قليلاً ثم أعد الإرسال.",
      expired: "انتهت صلاحية الرمز. اطلب رمزاً جديداً.",
      locked: "تم تجاوز عدد المحاولات المسموح. اطلب رمزاً جديداً.",
      missing_pending: "ابدأ خطوة التحقق أولاً قبل إدخال الرمز.",
      not_verified: "أكمل التحقق من البريد الإلكتروني قبل إرسال الطلب.",
    }[code];
  }

  return {
    invalid_target: "Vérifiez l'e-mail puis réessayez.",
    cooldown: "Un code a déjà été envoyé récemment. Merci d'attendre avant de le renvoyer.",
    expired: "Le code a expiré. Demandez-en un nouveau.",
    locked: "Nombre maximum d'essais atteint. Demandez un nouveau code.",
    missing_pending: "Commencez d'abord l'étape de vérification avant de saisir le code.",
    not_verified: "Vérifiez votre e-mail avant d'envoyer la demande.",
  }[code];
}
