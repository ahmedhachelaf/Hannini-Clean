import { reviews as seedReviews } from "@/data/seed";
import { syncDemoProviderReviewMetrics } from "@/lib/provider-store";
import type { Review, ReviewInput } from "@/lib/types";

function cloneSeedReviews() {
  return JSON.parse(JSON.stringify(seedReviews)) as Review[];
}

const demoReviews = cloneSeedReviews();

function findReviewIndex(id: string) {
  return demoReviews.findIndex((review) => review.id === id);
}

function syncProviderMetrics(providerId: string) {
  const providerReviews = demoReviews.filter((review) => review.providerId === providerId);
  syncDemoProviderReviewMetrics(providerId, providerReviews);
}

export function listDemoReviews(includeAllStatuses = false) {
  return demoReviews.filter((review) => includeAllStatuses || review.status === "approved");
}

export function findDemoReview(id: string) {
  return demoReviews.find((review) => review.id === id) ?? null;
}

export function createDemoReview(input: ReviewInput) {
  const existingReview = demoReviews.find((review) => review.bookingId === input.bookingId);

  if (existingReview) {
    return { review: null, reason: "duplicate" as const };
  }

  const review: Review = {
    id: `review-${Date.now().toString(36)}`,
    providerId: input.providerId,
    bookingId: input.bookingId,
    customerName: input.customerName.trim(),
    reviewerPhone: null,
    rating: input.rating,
    comment: input.comment.trim(),
    status: "pending_review",
    interactionVerified: true,
    adminNote: null,
    moderationReason: null,
    providerReply: null,
    providerReplyStatus: "none",
    providerReplyCreatedAt: null,
    createdAt: new Date().toISOString(),
  };

  demoReviews.unshift(review);
  syncProviderMetrics(review.providerId);

  return { review, reason: null };
}

export function updateDemoReviewStatus(
  reviewId: string,
  input: {
    status: Review["status"];
    adminNote?: string;
  },
) {
  const index = findReviewIndex(reviewId);

  if (index < 0) {
    return null;
  }

  const current = demoReviews[index];
  demoReviews[index] = {
    ...current,
    status: input.status,
    adminNote: input.adminNote?.trim() || null,
  };

  syncProviderMetrics(current.providerId);
  return demoReviews[index];
}

export function saveDemoProviderReply(reviewId: string, providerId: string, reply: string) {
  const index = findReviewIndex(reviewId);

  if (index < 0) {
    return null;
  }

  const current = demoReviews[index];

  if (current.providerId !== providerId || current.status !== "approved") {
    return null;
  }

  demoReviews[index] = {
    ...current,
    providerReply: reply.trim(),
    providerReplyStatus: "pending",
    providerReplyCreatedAt: new Date().toISOString(),
  };

  return demoReviews[index];
}
