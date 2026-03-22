import type { Provider, ProfileType } from "@/lib/types";

export type ReadinessCheckKey =
  | "category"
  | "location"
  | "contact"
  | "description"
  | "pricing"
  | "portfolio"
  | "availability"
  | "moderation"
  | "trust"
  | "digital"
  | "bulk";

export type JourneyStepKey =
  | "joined"
  | "profile_completed"
  | "portfolio_added"
  | "reviewed"
  | "approved"
  | "first_client"
  | "first_5_jobs"
  | "highly_rated"
  | "bulk_order_ready"
  | "mentor_ready";

export type OpportunityKey =
  | "individual_customers"
  | "repeat_clients"
  | "occasion_orders"
  | "business_buyers"
  | "bulk_ready";

export type ReadinessCheck = {
  key: ReadinessCheckKey;
  complete: boolean;
  weight: number;
};

export type JourneyStep = {
  key: JourneyStepKey;
  complete: boolean;
};

export type ReadinessTier = "starter" | "building" | "good" | "strong";

export function getProviderReadiness(provider: Provider) {
  const checks: ReadinessCheck[] = [
    { key: "category", complete: Boolean(provider.categorySlug), weight: 10 },
    { key: "location", complete: provider.zones.length > 0, weight: 12 },
    { key: "contact", complete: Boolean(provider.phoneNumber || provider.whatsappNumber), weight: 14 },
    {
      key: "description",
      complete:
        Boolean(provider.bio.ar?.trim() || provider.bio.fr?.trim()) &&
        Boolean(provider.shortTagline.ar?.trim() || provider.shortTagline.fr?.trim()),
      weight: 16,
    },
    { key: "pricing", complete: provider.hourlyRate > 0, weight: provider.profileType === "home_business" ? 6 : 10 },
    { key: "portfolio", complete: provider.gallery.length > 0, weight: 16 },
    { key: "availability", complete: provider.availability.length > 0, weight: 8 },
    { key: "moderation", complete: provider.status === "approved", weight: 12 },
    { key: "trust", complete: provider.isVerified || provider.reviewCount > 0, weight: 6 },
    {
      key: "digital",
      complete: Boolean(
        provider.socialLinks?.facebook ||
          provider.socialLinks?.instagram ||
          provider.socialLinks?.tiktok ||
          provider.socialLinks?.whatsappBusiness ||
          provider.socialLinks?.website,
      ),
      weight: 6,
    },
    {
      key: "bulk",
      complete: provider.profileType === "home_business" ? Boolean(provider.bulkOrders?.available) : true,
      weight: 8,
    },
  ];

  const relevantChecks = checks.filter((check) => !(provider.profileType === "service_provider" && check.key === "bulk"));
  const completed = relevantChecks.filter((check) => check.complete).length;
  const total = relevantChecks.length;
  const completedWeight = relevantChecks.filter((check) => check.complete).reduce((sum, check) => sum + check.weight, 0);
  const totalWeight = relevantChecks.reduce((sum, check) => sum + check.weight, 0);
  const score = Math.round((completedWeight / totalWeight) * 100);
  const scoreTier: ReadinessTier = score >= 85 ? "strong" : score >= 65 ? "good" : score >= 40 ? "building" : "starter";
  const strengthSignals = relevantChecks.filter((check) => check.complete).slice(0, 4);

  return {
    score,
    completed,
    total,
    scoreTier,
    checks: relevantChecks,
    completedWeight,
    totalWeight,
    strengthSignals,
    nextSteps: relevantChecks.filter((check) => !check.complete).slice(0, 3),
  };
}

export function getProviderJourney(provider: Provider) {
  const steps: JourneyStep[] = [
    { key: "joined", complete: true },
    {
      key: "profile_completed",
      complete:
        provider.zones.length > 0 &&
        Boolean(provider.categorySlug) &&
        Boolean(provider.phoneNumber || provider.whatsappNumber) &&
        Boolean(provider.bio.ar?.trim() || provider.bio.fr?.trim()),
    },
    { key: "portfolio_added", complete: provider.gallery.length > 0 },
    { key: "reviewed", complete: !["submitted", "under_review", "needs_more_info"].includes(provider.status) },
    { key: "approved", complete: provider.status === "approved" },
    { key: "first_client", complete: provider.completedJobs >= 1 },
    { key: "first_5_jobs", complete: provider.completedJobs >= 5 },
    { key: "highly_rated", complete: provider.rating >= 4.7 && provider.reviewCount >= 3 },
    {
      key: "bulk_order_ready",
      complete: provider.profileType === "home_business" && Boolean(provider.bulkOrders?.available),
    },
    {
      key: "mentor_ready",
      complete: provider.status === "approved" && provider.isVerified && provider.completedJobs >= 20 && provider.rating >= 4.8,
    },
  ];

  return {
    steps: steps.filter((step) => !(provider.profileType === "service_provider" && step.key === "bulk_order_ready")),
    completed: steps.filter((step) => step.complete).length,
  };
}

export function getOpportunityTypes(provider: Provider): OpportunityKey[] {
  const opportunities: OpportunityKey[] = ["individual_customers"];

  if (provider.completedJobs >= 3) {
    opportunities.push("repeat_clients");
  }

  if (provider.profileType === "home_business") {
    opportunities.push("occasion_orders");
  }

  if (provider.bulkOrders?.available) {
    opportunities.push("business_buyers", "bulk_ready");
  }

  return opportunities;
}

export function isMentorReady(provider: Provider) {
  return provider.status === "approved" && provider.isVerified && provider.completedJobs >= 20 && provider.rating >= 4.8;
}

export function getGrowthStage(provider: Provider): "starting" | "building" | "trusted" | "thriving" {
  if (isMentorReady(provider) || provider.completedJobs >= 25) {
    return "thriving";
  }

  if (provider.status === "approved" && provider.isVerified && provider.completedJobs >= 5) {
    return "trusted";
  }

  if (provider.status === "approved" || provider.gallery.length > 0) {
    return "building";
  }

  return "starting";
}

export function isOpportunityRelevant(profileType: ProfileType, key: OpportunityKey) {
  if (profileType === "service_provider") {
    return key !== "occasion_orders" && key !== "bulk_ready" && key !== "business_buyers";
  }

  return true;
}
