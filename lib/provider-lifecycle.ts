import type { ProviderStatus } from "@/lib/types";

export const CURRENT_CONDUCT_VERSION = "2026-03";
export const CURRENT_POLICY_VERSION = "2026-03";

type ProviderLifecycleMeta = {
  ageConfirmed: boolean;
  conductAccepted: boolean;
  policyAccepted: boolean;
  acceptedAt?: string | null;
  conductVersion?: string | null;
  policyVersion?: string | null;
  statusOverride?: ProviderStatus | null;
  rejectionReason?: string | null;
  adminNote?: string | null;
  managementToken?: string | null;
};

const TAG_PATTERNS = {
  acceptedAt: /\[accepted_at:([^\]]+)\]/,
  conductVersion: /\[conduct_version:([^\]]+)\]/,
  policyVersion: /\[policy_version:([^\]]+)\]/,
  statusOverride: /\[status_override:([^\]]+)\]/,
  rejectionReason: /\[rejection_reason:([^\]]+)\]/,
  adminNote: /\[admin_note:([^\]]+)\]/,
  managementToken: /\[manage_token:([^\]]+)\]/,
} as const;

function readTag(value: string, pattern: RegExp) {
  return value.match(pattern)?.[1]?.trim() ?? null;
}

export function parseProviderLifecycleMeta(notes: string | null | undefined): ProviderLifecycleMeta {
  const value = notes ?? "";

  return {
    ageConfirmed: value.includes("[age_confirmed]"),
    conductAccepted: value.includes("[conduct_accepted]"),
    policyAccepted: value.includes("[policy_accepted]"),
    acceptedAt: readTag(value, TAG_PATTERNS.acceptedAt),
    conductVersion: readTag(value, TAG_PATTERNS.conductVersion),
    policyVersion: readTag(value, TAG_PATTERNS.policyVersion),
    statusOverride: readTag(value, TAG_PATTERNS.statusOverride) as ProviderStatus | null,
    rejectionReason: readTag(value, TAG_PATTERNS.rejectionReason),
    adminNote: readTag(value, TAG_PATTERNS.adminNote),
    managementToken: readTag(value, TAG_PATTERNS.managementToken),
  };
}

export function deriveLifecycleStatus(
  approvalStatus: "pending" | "approved" | "rejected" | "needs_more_info",
  notes: string | null | undefined,
): ProviderStatus {
  const meta = parseProviderLifecycleMeta(notes);
  const hasLegacyNeedsMoreInfoTag = (notes ?? "").includes("[needs_more_info]");

  if (meta.statusOverride && meta.statusOverride !== "approved" && meta.statusOverride !== "rejected") {
    return meta.statusOverride;
  }

  if (approvalStatus === "needs_more_info" || hasLegacyNeedsMoreInfoTag) {
    return "needs_more_info";
  }

  if (approvalStatus === "pending") {
    if ((notes ?? "").includes("[status_override:under_review]")) {
      return "under_review";
    }

    return "submitted";
  }

  return approvalStatus;
}

export function mergeProviderLifecycleNotes(
  existingNotes: string | null | undefined,
  nextMeta: Partial<ProviderLifecycleMeta>,
  extraHumanNotes: string[] = [],
) {
  const current = parseProviderLifecycleMeta(existingNotes);
  const merged: ProviderLifecycleMeta = {
    ...current,
    ...nextMeta,
  };
  const raw = (existingNotes ?? "")
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => !item.startsWith("["));

  if (merged.rejectionReason) {
    raw.push(`Rejection reason: ${merged.rejectionReason}`);
  }

  if (merged.adminNote) {
    raw.push(`Admin note: ${merged.adminNote}`);
  }

  raw.push(...extraHumanNotes.filter(Boolean));

  const tags = [
    merged.ageConfirmed ? "[age_confirmed]" : "",
    merged.conductAccepted ? "[conduct_accepted]" : "",
    merged.policyAccepted ? "[policy_accepted]" : "",
    merged.acceptedAt ? `[accepted_at:${merged.acceptedAt}]` : "",
    merged.conductVersion ? `[conduct_version:${merged.conductVersion}]` : "",
    merged.policyVersion ? `[policy_version:${merged.policyVersion}]` : "",
    merged.statusOverride ? `[status_override:${merged.statusOverride}]` : "",
    merged.rejectionReason ? `[rejection_reason:${merged.rejectionReason}]` : "",
    merged.adminNote ? `[admin_note:${merged.adminNote}]` : "",
    merged.managementToken ? `[manage_token:${merged.managementToken}]` : "",
  ].filter(Boolean);

  return [...tags, ...Array.from(new Set(raw))].join(" | ");
}

export function createProviderManagementToken() {
  return `manage-${Math.random().toString(36).slice(2, 12)}`;
}

export function stripProviderLifecycleTags(notes: string | null | undefined) {
  return (notes ?? "")
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => !item.startsWith("["))
    .join(" | ");
}
