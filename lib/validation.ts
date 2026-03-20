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
  preferredContactMethod: z.enum(["whatsapp", "phone"]),
});

export const reviewSchema = z.object({
  bookingId: z.string().min(1),
  providerId: z.string().min(1),
  customerName: z.string().min(2),
  rating: z.number().min(1).max(5),
  comment: z.string().min(8),
});

export const adminLoginSchema = z.object({
  password: z.string().min(1),
});

export const providerSignupSchema = z.object({
  fullName: z.string().min(2),
  workshopName: z.string().optional().default(""),
  phoneNumber: z.string().min(8),
  whatsappNumber: z.string().min(8),
  categorySlug: z.string().min(1),
  zones: z.array(z.string()).min(1),
  hourlyRate: z.number().min(0),
  travelFee: z.number().min(0),
  yearsExperience: z.number().min(0),
  shortDescription: z.string().min(20),
  languages: z.array(z.string()).min(1),
  googleMapsUrl: z.string().url(),
  weekdays: z.array(z.string()).min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  profilePhotoName: z.string().optional(),
  workPhotoNames: z.array(z.string()).default([]),
  verificationDocumentName: z.string().optional(),
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
    wilaya: z.string().min(1),
  }),
]);
