import { z } from "zod";

export const bookingSchema = z.object({
  providerId: z.string().min(1),
  providerSlug: z.string().min(1),
  customerName: z.string().min(2),
  phoneNumber: z.string().min(8),
  selectedService: z.string().min(1),
  date: z.string().min(1),
  time: z.string().min(1),
  zoneSlug: z.string().min(1),
  address: z.string().min(4),
  googleMapsUrl: z.string().url(),
  issueDescription: z.string().min(10),
  notificationRequested: z.boolean().default(false),
  issuePhotoNames: z.array(z.string()).default([]),
  preferredContactMethod: z.enum(["whatsapp", "phone"]),
  isBusinessBuyer: z.boolean().default(false),
  quantityNeeded: z.string().optional().or(z.literal("")).default(""),
  productionNeed: z.string().optional().or(z.literal("")).default(""),
  requestedLeadTime: z.string().optional().or(z.literal("")).default(""),
  deliveryAreaNeeded: z.string().optional().or(z.literal("")).default(""),
});

export const reviewSchema = z.object({
  bookingId: z.string().min(1),
  providerId: z.string().min(1),
  customerName: z.string().min(2),
  rating: z.number().min(1).max(5),
  comment: z.string().min(8),
});

export const supportCaseSchema = z.object({
  actorRole: z.enum(["customer", "provider"]),
  category: z.enum([
    "booking_issue",
    "provider_report",
    "harassment",
    "unsafe_behavior",
    "fraud_or_scam",
    "inappropriate_contact",
    "misconduct",
    "payment_question",
    "account_help",
    "technical_issue",
    "general_support",
  ]),
  requestSafetyBlock: z.boolean().default(false),
  privacySensitive: z.boolean().default(false),
  subject: z.string().min(4),
  message: z.string().min(10),
  phoneNumber: z.string().optional().default(""),
  email: z.string().email().optional().or(z.literal("")).default(""),
  bookingId: z.string().optional().default(""),
  providerId: z.string().optional().default(""),
  providerSlug: z.string().optional().default(""),
  attachmentNames: z.array(z.string()).default([]),
});

export const supportReplySchema = z.object({
  caseId: z.string().min(1),
  authorRole: z.enum(["customer", "provider", "admin"]),
  authorName: z.string().min(2),
  message: z.string().min(2),
  attachmentNames: z.array(z.string()).default([]),
});

export const businessRequestSchema = z.object({
  companyName: z.string().min(2),
  contactName: z.string().min(2),
  phone: z.string().min(8),
  email: z.string().email().optional().or(z.literal("")).default(""),
  categorySlug: z.string().min(1),
  description: z.string().min(10),
  wilayaSlug: z.string().min(1),
  frequency: z.enum(["one_time", "recurring"]),
  timeline: z.string().min(2),
  budget: z.string().optional().or(z.literal("")).default(""),
  preferredProviderType: z.enum(["service_provider", "home_business", "either"]),
  attachmentNames: z.array(z.string()).default([]),
  consentAccepted: z.boolean().default(false),
}).superRefine((value, ctx) => {
  if (!value.consentAccepted) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["consentAccepted"],
      message: "consent_required",
    });
  }
});

export const adminLoginSchema = z.object({
  password: z.string().min(1),
});

export const providerSignupSchema = z.object({
  profileType: z.enum(["service_provider", "home_business"]),
  fullName: z.string().min(2),
  workshopName: z.string().optional().default(""),
  phoneNumber: z.string().optional().default(""),
  whatsappNumber: z.string().optional().default(""),
  categorySlug: z.string().min(1),
  zones: z.array(z.string()).min(1),
  hourlyRate: z.number().min(0).optional().default(0),
  travelFee: z.number().min(0).optional().default(0),
  yearsExperience: z.number().min(0).optional().default(0),
  shortDescription: z.string().min(6),
  languages: z.array(z.string()).optional().default(["العربية"]),
  googleMapsUrl: z.string().url().optional().or(z.literal("")).default(""),
  weekdays: z.array(z.string()).optional().default([]),
  startTime: z.string().optional().default("08:00"),
  endTime: z.string().optional().default("18:00"),
  profilePhotoName: z.string().optional(),
  workPhotoNames: z.array(z.string()).default([]),
  verificationDocumentName: z.string().optional(),
  facebookUrl: z.string().url().optional().or(z.literal("")).default(""),
  instagramUrl: z.string().url().optional().or(z.literal("")).default(""),
  tiktokUrl: z.string().url().optional().or(z.literal("")).default(""),
  whatsappBusinessUrl: z.string().url().optional().or(z.literal("")).default(""),
  websiteUrl: z.string().url().optional().or(z.literal("")).default(""),
  availableForBulkOrders: z.boolean().default(false),
  minimumOrderQuantity: z.string().optional().or(z.literal("")).default(""),
  productionCapacity: z.string().optional().or(z.literal("")).default(""),
  leadTime: z.string().optional().or(z.literal("")).default(""),
  deliveryArea: z.string().optional().or(z.literal("")).default(""),
  ageConfirmed: z.boolean().default(false),
  conductAccepted: z.boolean().default(false),
  policyAccepted: z.boolean().default(false),
}).superRefine((value, ctx) => {
  if (!value.phoneNumber && !value.whatsappNumber) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["phoneNumber"],
      message: "phone_or_whatsapp_required",
    });
  }

  if (!value.ageConfirmed) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["ageConfirmed"],
      message: "age_confirmation_required",
    });
  }

  if (!value.conductAccepted) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["conductAccepted"],
      message: "conduct_acceptance_required",
    });
  }

  if (!value.policyAccepted) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["policyAccepted"],
      message: "policy_acceptance_required",
    });
  }
});

export const metadataSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("category"),
    slug: z.string().min(1),
    nameAr: z.string().min(1),
    nameFr: z.string().min(1),
    icon: z.string().optional(),
  }),
  z.object({
    type: z.literal("zone"),
    slug: z.string().min(1),
    nameAr: z.string().min(1),
    nameFr: z.string().min(1),
    provinceSlug: z.string().min(1).optional(),
    wilaya: z.string().min(1),
  }),
]);
