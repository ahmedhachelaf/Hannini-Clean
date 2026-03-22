import { parseProviderLifecycleMeta } from "@/lib/provider-lifecycle";
import { verifyProviderPassword } from "@/lib/provider-password";
import { cookies } from "next/headers";
import { getProviderById, getProviders } from "@/lib/repository";
import type { Provider, ProviderSession } from "@/lib/types";

const PROVIDER_COOKIE = "hannini_provider_session";

function serializeProviderSession(value: ProviderSession) {
  return `${value.providerId}::${value.token}`;
}

function parseProviderSession(value: string | undefined) {
  if (!value) {
    return null;
  }

  const [providerId, token] = value.split("::");

  if (!providerId || !token) {
    return null;
  }

  return { providerId, token };
}

export async function setProviderSessionCookie(session: ProviderSession) {
  const store = await cookies();
  store.set(PROVIDER_COOKIE, serializeProviderSession(session), {
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

  if (!provider || provider.verification.managementToken !== session.token) {
    return null;
  }

  return provider;
}

export async function isProviderAuthenticated() {
  return Boolean(await getAuthenticatedProvider());
}

export async function authenticateProviderWithPassword(phoneOrWhatsapp: string, password: string): Promise<Provider | null> {
  const providers = await getProviders({}, true);
  const normalizedIdentifier = phoneOrWhatsapp.trim();

  return (
    providers.find(
      (provider) => {
        if (
          (provider.phoneNumber.trim() !== normalizedIdentifier && provider.whatsappNumber.trim() !== normalizedIdentifier) ||
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
  const normalizedAccessCode = accessCode.trim();

  return (
    providers.find(
      (provider) =>
        (provider.phoneNumber.trim() === normalizedIdentifier || provider.whatsappNumber.trim() === normalizedIdentifier) &&
        provider.verification.managementToken === normalizedAccessCode &&
        provider.status !== "deleted",
    ) ?? null
  );
}
