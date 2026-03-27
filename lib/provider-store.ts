import { categories, providers as seedProviders, zones } from "@/data/seed";
import {
  CURRENT_CONDUCT_VERSION,
  CURRENT_POLICY_VERSION,
  createProviderManagementToken,
  mergeProviderLifecycleNotes,
  parseProviderLifecycleMeta,
} from "@/lib/provider-lifecycle";
import { createProviderPasswordSecret } from "@/lib/provider-password";
import type { Locale, Provider, ProviderSignupInput, ProviderStatus } from "@/lib/types";
import { slugify } from "@/lib/utils";

function cloneSeedProviders() {
  return (JSON.parse(JSON.stringify(seedProviders)) as Provider[]).map((provider) => {
    if (provider.verification.managementToken) {
      return provider;
    }

    const managementToken = createProviderManagementToken();

    return {
      ...provider,
      verification: {
        ...provider.verification,
        managementToken,
        notes: mergeProviderLifecycleNotes(provider.verification.notes, {
          ageConfirmed: provider.verification.ageConfirmed,
          conductAccepted: provider.verification.conductAccepted,
          policyAccepted: provider.verification.policyAccepted,
          acceptedAt: provider.verification.acceptedAt,
          conductVersion: provider.verification.conductVersion,
          policyVersion: provider.verification.policyVersion,
          managementToken,
        }),
        hasPassword: provider.verification.hasPassword ?? false,
      },
    };
  });
}

const demoProviders = cloneSeedProviders();
const zoneMap = new Map(zones.map((zone) => [zone.slug, zone]));
const categoryMap = new Map(categories.map((category) => [category.slug, category]));

function findProviderIndex(id: string) {
  return demoProviders.findIndex((provider) => provider.id === id);
}

function buildGallery(workPhotoNames: string[]) {
  return workPhotoNames.slice(0, 3).map((_, index) => `/gallery/work-${(index % 3) + 1}.svg`);
}

function syncVerificationMeta(provider: Provider) {
  const meta = parseProviderLifecycleMeta(provider.verification.notes);
  provider.email = meta.accountEmail ?? provider.email ?? undefined;
  provider.verification.managementToken = meta.managementToken ?? provider.verification.managementToken ?? null;
  provider.verification.ageConfirmed = meta.ageConfirmed;
  provider.verification.conductAccepted = meta.conductAccepted;
  provider.verification.policyAccepted = meta.policyAccepted;
  provider.verification.acceptedAt = meta.acceptedAt;
  provider.verification.conductVersion = meta.conductVersion;
  provider.verification.policyVersion = meta.policyVersion;
  provider.verification.rejectionReason = meta.rejectionReason;
  provider.verification.adminNote = meta.adminNote;
  provider.verification.hasPassword = Boolean(meta.passwordHash && meta.passwordSalt);
}

export function listDemoProviders() {
  return demoProviders;
}

export function findDemoProvider(id: string) {
  return demoProviders.find((provider) => provider.id === id) ?? null;
}

export function findDemoProviderBySlug(slug: string) {
  return demoProviders.find((provider) => provider.slug === slug) ?? null;
}

export function syncDemoProviderReviewMetrics(
  providerId: string,
  reviews: Array<{ rating: number; status: "pending_review" | "approved" | "rejected" }>,
) {
  const provider = findDemoProvider(providerId);

  if (!provider) {
    return null;
  }

  const approvedReviews = reviews.filter((review) => review.status === "approved");
  const reviewCount = approvedReviews.length;
  const ratingAverage = reviewCount > 0
    ? approvedReviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
    : 0;

  provider.reviewCount = reviewCount;
  provider.rating = Number(ratingAverage.toFixed(1));

  return provider;
}

export function createDemoProviderApplication(input: ProviderSignupInput, locale: Locale) {
  const timestamp = new Date().toISOString();
  const zone = zoneMap.get(input.zones[0]);
  const category = categoryMap.get(input.categorySlug);
  const providerId = `provider-${Date.now().toString(36)}`;
  const providerSlug = `${slugify(input.workshopName || input.fullName)}-${Date.now().toString(36).slice(-5)}`;
  const managementToken = createProviderManagementToken();
  const passwordSecret = createProviderPasswordSecret(input.password);
  const notes = mergeProviderLifecycleNotes(
    "",
    {
      accountEmail: input.email,
      ageConfirmed: input.ageConfirmed,
      conductAccepted: input.conductAccepted,
      policyAccepted: input.policyAccepted,
      acceptedAt: timestamp,
      conductVersion: CURRENT_CONDUCT_VERSION,
      policyVersion: CURRENT_POLICY_VERSION,
      statusOverride: "submitted",
      managementToken,
      passwordSalt: passwordSecret.salt,
      passwordHash: passwordSecret.hash,
    },
    [
      input.profilePhotoName ? `Profile photo: ${input.profilePhotoName}` : "",
      input.workPhotoNames.length > 0 ? `Work photos: ${input.workPhotoNames.join(", ")}` : "",
      input.verificationDocumentName ? `Verification document: ${input.verificationDocumentName}` : "",
      locale === "ar" ? "طلب جديد بانتظار مراجعة الإدارة." : "Nouvelle candidature en attente de revue admin.",
    ],
  );

  const nextProvider: Provider = {
    id: providerId,
    slug: providerSlug,
    profileType: input.profileType,
    displayName: input.fullName,
    workshopName: input.workshopName || null,
    email: input.email,
    categorySlug: input.categorySlug,
    rating: 0,
    reviewCount: 0,
    completedJobs: 0,
    responseTimeMinutes: 60,
    isVerified: false,
    status: "submitted",
    featured: false,
    yearsExperience: input.yearsExperience ?? 0,
    hourlyRate: input.hourlyRate ?? 0,
    travelFee: input.travelFee ?? 0,
    zones: input.zones,
    coordinates: zone?.coordinates ?? { latitude: 35.6981, longitude: -0.6348 },
    languages: input.languages && input.languages.length > 0 ? input.languages : ["العربية"],
    phoneNumber: input.phoneNumber || input.whatsappNumber,
    whatsappNumber: input.whatsappNumber || input.phoneNumber,
    googleMapsUrl:
      input.googleMapsUrl ||
      `https://maps.google.com/?q=${encodeURIComponent(
        `${zone?.name.fr ?? input.zones[0]} ${zone?.provinceName.fr ?? "Algeria"}`,
      )}`,
    bio: {
      ar: input.shortDescription || input.fullName,
      fr: input.shortDescription || input.fullName,
    },
    shortTagline: {
      ar: input.workshopName || input.fullName,
      fr: input.workshopName || input.fullName,
    },
    profilePhotoUrl: "/placeholders/provider-avatar.svg",
    gallery: buildGallery(input.workPhotoNames),
    galleryCaptions: input.workPhotoNames.slice(0, 3),
    availability: [],
    verification: {
      status: "pending",
      documentName: input.verificationDocumentName ?? null,
      notes,
      ageConfirmed: input.ageConfirmed,
      conductAccepted: input.conductAccepted,
      policyAccepted: input.policyAccepted,
      acceptedAt: timestamp,
      conductVersion: CURRENT_CONDUCT_VERSION,
      policyVersion: CURRENT_POLICY_VERSION,
      managementToken,
      hasPassword: true,
    },
  };

  if (!category) {
    nextProvider.profileType = "service_provider";
  }

  demoProviders.unshift(nextProvider);
  return { provider: nextProvider, managementToken };
}

export function updateDemoProviderModeration(
  providerId: string,
  input: {
    status?: ProviderStatus;
    isVerified?: boolean;
    verificationStatus?: "pending" | "verified" | "rejected";
    adminNote?: string;
    rejectionReason?: string;
  },
) {
  const index = findProviderIndex(providerId);

  if (index < 0) {
    return null;
  }

  const provider = demoProviders[index];
  const nextStatus = input.status ?? provider.status;
  provider.status = nextStatus;

  if (typeof input.isVerified === "boolean") {
    provider.isVerified = input.isVerified;
  }

  provider.verification.status =
    input.verificationStatus ??
    (nextStatus === "rejected" ? "rejected" : provider.isVerified ? "verified" : provider.verification.status);
  provider.verification.adminNote = input.adminNote ?? provider.verification.adminNote ?? null;
  provider.verification.rejectionReason = input.rejectionReason ?? provider.verification.rejectionReason ?? null;
  provider.verification.notes = mergeProviderLifecycleNotes(
    provider.verification.notes,
    {
      statusOverride:
        nextStatus === "approved" || nextStatus === "rejected" ? null : nextStatus,
      adminNote: input.adminNote ?? provider.verification.adminNote ?? undefined,
      rejectionReason: input.rejectionReason ?? provider.verification.rejectionReason ?? undefined,
    },
  );
  syncVerificationMeta(provider);

  return provider;
}

export function updateDemoProviderSelfService(
  providerId: string,
  access: {
    authenticated?: boolean;
    managementToken?: string | null;
  },
  input: {
    action: "update" | "deactivate" | "reactivate" | "request_deletion";
    workshopName?: string;
    email?: string;
    phoneNumber?: string;
    whatsappNumber?: string;
    shortDescription?: string;
    zoneSlug?: string;
    newPassword?: string;
  },
) {
  const provider = findDemoProvider(providerId);

  if (!provider) {
    return null;
  }

  const hasSessionAccess = Boolean(access.authenticated);
  const hasTokenAccess =
    Boolean(access.managementToken) && provider.verification.managementToken === access.managementToken;

  if (!hasSessionAccess && !hasTokenAccess) {
    return null;
  }

  if (input.action === "update") {
    provider.workshopName = input.workshopName?.trim() || provider.workshopName;
    provider.displayName = provider.displayName;
    provider.email = input.email?.trim().toLowerCase() || provider.email;
    provider.phoneNumber = input.phoneNumber?.trim() || provider.phoneNumber;
    provider.whatsappNumber = input.whatsappNumber?.trim() || provider.whatsappNumber;

    if (input.shortDescription?.trim()) {
      provider.bio.ar = input.shortDescription.trim();
      provider.bio.fr = input.shortDescription.trim();
    }

    if (input.zoneSlug?.trim()) {
      provider.zones = [input.zoneSlug.trim()];
      provider.coordinates = zoneMap.get(input.zoneSlug.trim())?.coordinates ?? provider.coordinates;
    }

    if (input.newPassword?.trim()) {
      const secret = createProviderPasswordSecret(input.newPassword.trim());
      provider.verification.hasPassword = true;
      provider.verification.notes = mergeProviderLifecycleNotes(provider.verification.notes, {
        accountEmail: input.email?.trim().toLowerCase() || provider.email,
        passwordSalt: secret.salt,
        passwordHash: secret.hash,
      });
    } else if (input.email?.trim()) {
      provider.verification.notes = mergeProviderLifecycleNotes(provider.verification.notes, {
        accountEmail: input.email.trim().toLowerCase(),
      });
    }

    provider.verification.notes = mergeProviderLifecycleNotes(provider.verification.notes, {}, [
      "Provider updated profile details.",
    ]);
    syncVerificationMeta(provider);
    return provider;
  }

  if (input.action === "deactivate") {
    provider.status = "deactivated_by_provider";
    provider.verification.notes = mergeProviderLifecycleNotes(provider.verification.notes, {
      statusOverride: "deactivated_by_provider",
    });
    syncVerificationMeta(provider);
    return provider;
  }

  if (input.action === "reactivate") {
    if (provider.status !== "deactivated_by_provider") {
      return null;
    }

    provider.status = "approved";
    provider.verification.notes = mergeProviderLifecycleNotes(provider.verification.notes, {
      statusOverride: null,
    });
    syncVerificationMeta(provider);
    return provider;
  }

  provider.status = "pending_deletion";
  provider.verification.notes = mergeProviderLifecycleNotes(provider.verification.notes, {
    statusOverride: "pending_deletion",
  });
  syncVerificationMeta(provider);
  return provider;
}
