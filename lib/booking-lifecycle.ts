import type { Booking, BookingInput } from "@/lib/types";

type BookingLifecycleMeta = {
  notificationRequested?: boolean;
  issuePhotoNames?: string[];
  isBusinessBuyer?: boolean;
  quantityNeeded?: string;
  productionNeed?: string;
  requestedLeadTime?: string;
  deliveryAreaNeeded?: string;
  providerNote?: string;
  proposedDate?: string;
  proposedTime?: string;
  customerAccessToken?: string;
  updatedAt?: string;
};

const TAG_PATTERNS = {
  quantityNeeded: /\[quantity_needed:([^\]]+)\]/,
  productionNeed: /\[production_need:([^\]]+)\]/,
  requestedLeadTime: /\[requested_lead_time:([^\]]+)\]/,
  deliveryAreaNeeded: /\[delivery_area_needed:([^\]]+)\]/,
  providerNote: /\[provider_note:([^\]]+)\]/,
  proposedDate: /\[proposed_date:([^\]]+)\]/,
  proposedTime: /\[proposed_time:([^\]]+)\]/,
  customerAccessToken: /\[customer_token:([^\]]+)\]/,
  updatedAt: /\[booking_updated_at:([^\]]+)\]/,
} as const;

function readTag(value: string, pattern: RegExp) {
  return value.match(pattern)?.[1]?.trim() ?? undefined;
}

function decodeListTag(value: string, key: string) {
  const match = value.match(new RegExp(`\\[${key}:([^\\]]+)\\]`));

  if (!match?.[1]) {
    return [];
  }

  return match[1]
    .split(",")
    .map((item) => decodeURIComponent(item.trim()))
    .filter(Boolean);
}

export function parseBookingLifecycleMeta(rawDescription: string | null | undefined): BookingLifecycleMeta {
  const value = rawDescription ?? "";

  return {
    notificationRequested: value.includes("[notification_requested]"),
    issuePhotoNames: decodeListTag(value, "issue_photos"),
    isBusinessBuyer: value.includes("[business_buyer]"),
    quantityNeeded: readTag(value, TAG_PATTERNS.quantityNeeded),
    productionNeed: readTag(value, TAG_PATTERNS.productionNeed),
    requestedLeadTime: readTag(value, TAG_PATTERNS.requestedLeadTime),
    deliveryAreaNeeded: readTag(value, TAG_PATTERNS.deliveryAreaNeeded),
    providerNote: readTag(value, TAG_PATTERNS.providerNote),
    proposedDate: readTag(value, TAG_PATTERNS.proposedDate),
    proposedTime: readTag(value, TAG_PATTERNS.proposedTime),
    customerAccessToken: readTag(value, TAG_PATTERNS.customerAccessToken),
    updatedAt: readTag(value, TAG_PATTERNS.updatedAt),
  };
}

export function stripBookingLifecycleTags(rawDescription: string | null | undefined) {
  return (rawDescription ?? "")
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => !item.startsWith("["))
    .join(" | ");
}

export function mergeBookingLifecycleDescription(
  existingDescription: string | null | undefined,
  nextMeta: Partial<BookingLifecycleMeta>,
  extraHumanNotes: string[] = [],
) {
  const current = parseBookingLifecycleMeta(existingDescription);
  const merged = {
    ...current,
    ...nextMeta,
  };
  const raw = stripBookingLifecycleTags(existingDescription)
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);

  raw.push(...extraHumanNotes.filter(Boolean));

  const tags = [
    merged.notificationRequested ? "[notification_requested]" : "",
    merged.issuePhotoNames && merged.issuePhotoNames.length > 0
      ? `[issue_photos:${merged.issuePhotoNames.map((item) => encodeURIComponent(item)).join(",")}]`
      : "",
    merged.isBusinessBuyer ? "[business_buyer]" : "",
    merged.quantityNeeded ? `[quantity_needed:${merged.quantityNeeded}]` : "",
    merged.productionNeed ? `[production_need:${merged.productionNeed}]` : "",
    merged.requestedLeadTime ? `[requested_lead_time:${merged.requestedLeadTime}]` : "",
    merged.deliveryAreaNeeded ? `[delivery_area_needed:${merged.deliveryAreaNeeded}]` : "",
    merged.providerNote ? `[provider_note:${merged.providerNote}]` : "",
    merged.proposedDate ? `[proposed_date:${merged.proposedDate}]` : "",
    merged.proposedTime ? `[proposed_time:${merged.proposedTime}]` : "",
    merged.customerAccessToken ? `[customer_token:${merged.customerAccessToken}]` : "",
    merged.updatedAt ? `[booking_updated_at:${merged.updatedAt}]` : "",
  ].filter(Boolean);

  return [...tags, ...Array.from(new Set(raw))].join(" | ");
}

export function createCustomerBookingAccessToken() {
  return `booking-${Math.random().toString(36).slice(2, 12)}`;
}

export function buildBookingDescription(input: BookingInput, locale: "ar" | "fr", customerAccessToken: string) {
  return mergeBookingLifecycleDescription(
    input.issueDescription,
    {
      notificationRequested: input.notificationRequested,
      issuePhotoNames: input.issuePhotoNames,
      isBusinessBuyer: input.isBusinessBuyer,
      quantityNeeded: input.quantityNeeded,
      productionNeed: input.productionNeed,
      requestedLeadTime: input.requestedLeadTime,
      deliveryAreaNeeded: input.deliveryAreaNeeded,
      customerAccessToken,
      updatedAt: new Date().toISOString(),
    },
    [
      input.notificationRequested
        ? locale === "ar"
          ? "طلب متابعة عبر واتساب: نعم"
          : "Suivi WhatsApp demandé : oui"
        : "",
      input.isBusinessBuyer ? (locale === "ar" ? "استفسار مشترٍ مهني أو كمية أكبر." : "Demande volume / acheteur professionnel.") : "",
      input.quantityNeeded ? `${locale === "ar" ? "الكمية" : "Quantité"}: ${input.quantityNeeded}` : "",
      input.productionNeed ? `${locale === "ar" ? "تفاصيل الكمية" : "Besoin détaillé"}: ${input.productionNeed}` : "",
      input.requestedLeadTime ? `${locale === "ar" ? "المهلة المطلوبة" : "Délai souhaité"}: ${input.requestedLeadTime}` : "",
      input.deliveryAreaNeeded ? `${locale === "ar" ? "منطقة التسليم" : "Zone de remise"}: ${input.deliveryAreaNeeded}` : "",
      input.issuePhotoNames.length > 0
        ? `${locale === "ar" ? "صور مرفقة" : "Photos jointes"}: ${input.issuePhotoNames.join(", ")}`
        : "",
    ],
  );
}

export function hydrateBookingLifecycle(booking: Booking): Booking {
  const meta = parseBookingLifecycleMeta(booking.issueDescription);

  return {
    ...booking,
    issueDescription: stripBookingLifecycleTags(booking.issueDescription),
    notificationRequested: meta.notificationRequested,
    issuePhotoNames: meta.issuePhotoNames,
    isBusinessBuyer: meta.isBusinessBuyer,
    quantityNeeded: meta.quantityNeeded,
    productionNeed: meta.productionNeed,
    requestedLeadTime: meta.requestedLeadTime,
    deliveryAreaNeeded: meta.deliveryAreaNeeded,
    providerNote: meta.providerNote,
    proposedDate: meta.proposedDate,
    proposedTime: meta.proposedTime,
    customerAccessToken: meta.customerAccessToken,
    updatedAt: meta.updatedAt ?? booking.updatedAt,
  };
}
