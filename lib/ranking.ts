import type { Provider } from "@/lib/types";

export function getProviderScore(provider: Provider) {
  const ratingScore = provider.rating * 22;
  const jobScore = Math.min(provider.completedJobs / 5, 24);
  const responseScore = Math.max(0, 22 - provider.responseTimeMinutes / 6);
  const verifiedScore = provider.isVerified ? 12 : 0;
  const womenSafeScore = provider.womenSafe ? 8 : 0;

  return ratingScore + jobScore + responseScore + verifiedScore + womenSafeScore;
}
