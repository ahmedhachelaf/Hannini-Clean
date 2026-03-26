import { createHmac, timingSafeEqual } from "node:crypto";
import { parseProviderLifecycleMeta } from "@/lib/provider-lifecycle";
import { verifyProviderPassword } from "@/lib/provider-password";
import { cookies } from "next/headers";
import { getProviderById, getProviders } from "@/lib/repository";
import type { Provider } from "@/lib/types";

const PROVIDER_COOKIE = "hannini_provider_session";
function getProviderSessionSecret(): string {
  const secret = process.env.PROVIDER_SESSION_SECRET ?? process.env.ADMIN_ACCESS_PASSWORD;
  if (!secret) {
    throw new Error("PROVIDER_SESSION_SECRET (or ADMIN_ACCESS_PASSWORD) is not configured.");
  }
  return secret;
}

type ParsedProviderSession = {
  providerId: string;
  sessionProof: string;
};

function createProviderSessionProof(providerId: string) {
  return createHmac("sha256", getProviderSessionSecret()).update(providerId).digest("hex");
}

function validateProviderSessionProof(providerId: string, sessionProof: string) {
  const expected = createProviderSessionProof(providerId);

  if (expected.length !== sessionProof.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(expected), Buffer.from(sessionProof));
}

function serializeProviderSession(providerId: string) {
  return `${providerId}::${createProviderSessionProof(providerId)}`;
}

function parseProviderSession(value: string | undefined) {
  if (!value) {
    return null;
  }

  const [providerId, sessionProof] = value.split("::");

  if (!providerId || !sessionProof) {
    return null;
  }

  return { providerId, sessionProof } satisfies ParsedProviderSession;
}

export async function setProviderSessionCookie(providerId: string) {
  const store = await cookies();
  store.set(PROVIDER_COOKIE, serializeProviderSession(providerId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function clearProviderSessionCookie() {
  const store = await cookies();
  store.delete(PROVIDER_COOKIE);
}

export async function getProviderSession() {
  const store = await cookies();
  return parseProviderSession(store.get(PROVIDER_COOKIE)?.value);
}

export async function getAuthenticatedProvider() {
  const session = await getProviderSession();

  if (!session) {
    return null;
  }

  const provider = await getProviderById(session.providerId, true);

  if (!provider) {
    return null;
  }

  if (
    !validateProviderSessionProof(session.providerId, session.sessionProof) &&
    provider.verification.managementToken !== session.sessionProof
  ) {
    return null;
  }

  return provider;
}

export async function isProviderAuthenticated() {
  return Boolean(await getAuthenticatedProvider());
}

export async function authenticateProviderWithPassword(identifier: string, password: string): Promise<Provider | null> {
  const providers = await getProviders({}, true);
  const normalizedIdentifier = identifier.trim();
  const normalizedIdentifierLower = normalizedIdentifier.toLowerCase();

  return (
    providers.find(
      (provider) => {
        const accountEmail = parseProviderLifecycleMeta(provider.verification.notes).accountEmail?.trim().toLowerCase();
        if (
          (
            provider.phoneNumber.trim() !== normalizedIdentifier &&
            provider.whatsappNumber.trim() !== normalizedIdentifier &&
            accountEmail !== normalizedIdentifierLower
          ) ||
          provider.status === "deleted"
        ) {
          return false;
        }

        const meta = parseProviderLifecycleMeta(provider.verification.notes);
        return verifyProviderPassword(password.trim(), meta.passwordSalt, meta.passwordHash);
      },
    ) ?? null
  );
}

export async function authenticateProviderWithAccessCode(phoneOrWhatsapp: string, accessCode: string): Promise<Provider | null> {
  const providers = await getProviders({}, true);
  const normalizedIdentifier = phoneOrWhatsapp.trim();
  const normalizedIdentifierLower = normalizedIdentifier.toLowerCase();
  const normalizedAccessCode = accessCode.trim();

  return (
    providers.find(
      (provider) => {
        const accountEmail = parseProviderLifecycleMeta(provider.verification.notes).accountEmail?.trim().toLowerCase();

        return (
          (
            provider.phoneNumber.trim() === normalizedIdentifier ||
            provider.whatsappNumber.trim() === normalizedIdentifier ||
            accountEmail === normalizedIdentifierLower
          ) &&
          provider.verification.managementToken === normalizedAccessCode &&
          provider.status !== "deleted"
        );
      },
    ) ?? null
  );
}
