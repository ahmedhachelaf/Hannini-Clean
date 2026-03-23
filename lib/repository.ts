import {
  businessRequests as seedBusinessRequests,
  categories as seedCategories,
  providers as seedProviders,
  zones as seedZones,
} from "@/data/seed";
import { hydrateBookingLifecycle } from "@/lib/booking-lifecycle";
import { findDemoBooking, listDemoBookings } from "@/lib/booking-store";
import { findDemoBusinessRequest, listDemoBusinessRequests } from "@/lib/business-request-store";
import { formatDate } from "@/lib/format";
import { defaultLocale } from "@/lib/i18n";
import { deriveLifecycleStatus, parseProviderLifecycleMeta, stripProviderLifecycleTags } from "@/lib/provider-lifecycle";
import { findDemoProvider, findDemoProviderBySlug, listDemoProviders } from "@/lib/provider-store";
import { listDemoReviews } from "@/lib/review-store";
import { getProviderScore } from "@/lib/ranking";
import { createServerSupabaseClient, hasSupabaseServerEnv } from "@/lib/supabase/server";
import { findDemoSupportCase, listDemoSupportCases } from "@/lib/support-store";
import type {
  AdminDashboardData,
  Booking,
  BusinessRequest,
  BusinessRequestStatus,
  Category,
  Filters,
  MapCoordinates,
  ProfileType,
  Provider,
  ProviderStatus,
  Review,
  SortOption,
  SupportCase,
  SupportMessage,
  SupportStatus,
  Zone,
} from "@/lib/types";

type ProviderRow = {
  id: string;
  slug: string;
  display_name: string;
  workshop_name: string | null;
  rating_average: number | null;
  review_count: number | null;
  completed_jobs_count: number | null;
  response_time_minutes: number | null;
  is_verified: boolean | null;
  approval_status: "pending" | "approved" | "rejected" | "needs_more_info";
  featured: boolean | null;
  years_experience: number | null;
  hourly_rate: number | null;
  travel_fee: number | null;
  phone_number: string;
  whatsapp_number: string;
  google_maps_url: string;
  facebook_url?: string | null;
  instagram_url?: string | null;
  tiktok_url?: string | null;
  whatsapp_business_url?: string | null;
  website_url?: string | null;
  available_for_bulk_orders?: boolean | null;
  minimum_order_quantity?: string | null;
  production_capacity?: string | null;
  lead_time?: string | null;
  delivery_area?: string | null;
  bio_ar: string;
  bio_fr: string;
  tagline_ar: string;
  tagline_fr: string;
  profile_photo_url: string | null;
  provider_services?: Array<{
    category_slug: string;
  }>;
  service_areas?: Array<{
    zone_slug: string;
  }>;
  availability?: Array<{
    day_key: string;
    label_ar: string | null;
    label_fr: string | null;
    start_time: string;
    end_time: string;
  }>;
  provider_photos?: Array<{
    url: string | null;
    alt_text?: string | null;
    sort_order?: number | null;
  }>;
  provider_verifications?: Array<{
    status: "pending" | "verified" | "rejected";
    document_name: string | null;
    notes: string | null;
  }>;
};

type ReviewRow = {
  id: string;
  provider_id: string;
  booking_id: string;
  customer_name: string;
  rating: number;
  review_text: string;
  status?: Review["status"] | null;
  admin_note?: string | null;
  created_at: string;
};

type BookingRow = {
  id: string;
  provider_id: string;
  customer_name: string;
  phone_number: string;
  service_slug: string;
  booking_date: string;
  booking_time: string;
  zone_slug: string;
  address: string;
  google_maps_url: string;
  issue_description: string;
  preferred_contact_method: Booking["preferredContactMethod"];
  status: Booking["status"];
  created_at: string;
  updated_at?: string;
  providers?: Array<{
    slug: string;
  }> | null;
};

type SupportCaseRow = {
  id: string;
  actor_role: SupportCase["actorRole"];
  issue_category: SupportCase["category"];
  status: SupportStatus;
  request_safety_block?: boolean | null;
  privacy_sensitive?: boolean | null;
  subject: string;
  message: string;
  phone_number: string | null;
  email: string | null;
  booking_id: string | null;
  provider_id: string | null;
  provider_slug: string | null;
  attachment_names: string[] | null;
  created_at: string;
  updated_at: string;
  support_messages?: SupportMessageRow[];
};

type SupportMessageRow = {
  id: string;
  support_case_id: string;
  author_role: SupportMessage["authorRole"];
  author_name: string;
  message: string;
  attachment_names: string[] | null;
  created_at: string;
};

type BusinessRequestRow = {
  id: string;
  company_name: string;
  contact_name: string;
  phone: string;
  email: string | null;
  category_slug: string;
  description: string;
  wilaya_slug: string;
  frequency: "one_time" | "recurring";
  timeline: string;
  budget: string | null;
  preferred_provider_type: "service_provider" | "home_business" | "either";
  attachment_names: string[] | null;
  status: BusinessRequestStatus;
  matched_provider_ids: string[] | null;
  admin_notes: string | null;
  consent_accepted: boolean | null;
  created_at: string;
  updated_at: string;
};

function stripPrefix(value: string, prefix: string) {
  return value.startsWith(prefix) ? value.slice(prefix.length) : value;
}

function parseSupportMessageMetadata(message: string) {
  let nextMessage = message;
  let requestSafetyBlock = false;
  let privacySensitive = false;

  if (nextMessage.startsWith("[request_safety_block]")) {
    requestSafetyBlock = true;
    nextMessage = stripPrefix(nextMessage, "[request_safety_block]");
  }

  if (nextMessage.startsWith("[privacy_sensitive]")) {
    privacySensitive = true;
    nextMessage = stripPrefix(nextMessage, "[privacy_sensitive]");
  }

  return {
    requestSafetyBlock,
    privacySensitive,
    message: nextMessage.trim(),
  };
}

const fallbackCoordinatesByZone: Record<string, MapCoordinates> = Object.fromEntries(
  seedZones.map((zone) => [zone.slug, zone.coordinates]),
);

const zoneDetailsBySlug = new Map(seedZones.map((zone) => [zone.slug, zone]));
const categoryDetailsBySlug = new Map(seedCategories.map((category) => [category.slug, category]));

const provinceLabels = new Map(
  seedZones.map((zone) => [zone.provinceSlug, zone.provinceName] as const),
);

function getZoneCoordinates(zoneSlug: string | undefined) {
  if (!zoneSlug) {
    return { latitude: 35.6981, longitude: -0.6348 };
  }

  return fallbackCoordinatesByZone[zoneSlug] ?? { latitude: 35.6981, longitude: -0.6348 };
}

function getProvinceName(provinceSlug: string | undefined) {
  return provinceLabels.get(provinceSlug ?? "") ?? { ar: "غير محدد", fr: "Non defini" };
}

function parseVerificationNotes(notes: string | null | undefined) {
  const value = parseProviderLifecycleMeta(notes);

  return {
    ageConfirmed: value.ageConfirmed,
    conductAccepted: value.conductAccepted,
    policyAccepted: value.policyAccepted,
    acceptedAt: value.acceptedAt,
    conductVersion: value.conductVersion,
    policyVersion: value.policyVersion,
    rejectionReason: value.rejectionReason,
    adminNote: value.adminNote,
    managementToken: value.managementToken,
    passwordSalt: value.passwordSalt,
    passwordHash: value.passwordHash,
  };
}

function sortProviders(providers: Provider[], sort: SortOption = "top") {
  const nextProviders = [...providers];

  nextProviders.sort((a, b) => {
    if (sort === "rating") {
      return b.rating - a.rating || b.reviewCount - a.reviewCount;
    }

    if (sort === "response") {
      return a.responseTimeMinutes - b.responseTimeMinutes || b.rating - a.rating;
    }

    if (sort === "jobs") {
      return b.completedJobs - a.completedJobs || b.rating - a.rating;
    }

    return getProviderScore(b) - getProviderScore(a);
  });

  return nextProviders;
}

function applyProviderFilters(providers: Provider[], filters: Filters = {}) {
  const query = filters.query?.trim().toLowerCase();

  const filtered = providers.filter((provider) => {
    if (filters.profileType && provider.profileType !== filters.profileType) {
      return false;
    }

    if (filters.category && provider.categorySlug !== filters.category) {
      return false;
    }

    if (filters.province) {
      const matchesProvince = provider.zones.some((zoneSlug) => zoneDetailsBySlug.get(zoneSlug)?.provinceSlug === filters.province);

      if (!matchesProvince) {
        return false;
      }
    }

    if (filters.zone && !provider.zones.includes(filters.zone)) {
      return false;
    }

    if (!query) {
      return true;
    }

    const haystack = [
      provider.displayName,
      provider.workshopName ?? "",
      provider.bio.ar,
      provider.bio.fr,
      provider.shortTagline.ar,
      provider.shortTagline.fr,
      provider.categorySlug,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });

  return sortProviders(filtered, filters.sort ?? "top");
}

function mapProviderRow(row: ProviderRow): Provider {
  const providerZones = row.service_areas?.map((zone) => zone.zone_slug) ?? [];
  const coordinates = getZoneCoordinates(providerZones[0]);
  const verification = row.provider_verifications?.[0];
  const derivedStatus = deriveLifecycleStatus(row.approval_status, verification?.notes);
  const verificationFlags = parseVerificationNotes(verification?.notes);
  const categorySlug = row.provider_services?.[0]?.category_slug ?? "handyman";
  const profileType = categoryDetailsBySlug.get(categorySlug)?.lane ?? "service_provider";

  return {
    id: row.id,
    slug: row.slug,
    profileType,
    displayName: row.display_name,
    workshopName: row.workshop_name,
    categorySlug,
    rating: row.rating_average ?? 0,
    reviewCount: row.review_count ?? 0,
    completedJobs: row.completed_jobs_count ?? 0,
    responseTimeMinutes: row.response_time_minutes ?? 60,
    isVerified: Boolean(row.is_verified),
    status: derivedStatus,
    featured: Boolean(row.featured),
    yearsExperience: row.years_experience ?? 0,
    hourlyRate: row.hourly_rate ?? 0,
    travelFee: row.travel_fee ?? 0,
    zones: providerZones,
    coordinates,
    languages: ["العربية", "Français"],
    phoneNumber: row.phone_number,
    whatsappNumber: row.whatsapp_number,
    googleMapsUrl: row.google_maps_url,
    socialLinks: {
      facebook: row.facebook_url ?? undefined,
      instagram: row.instagram_url ?? undefined,
      tiktok: row.tiktok_url ?? undefined,
      whatsappBusiness: row.whatsapp_business_url ?? undefined,
      website: row.website_url ?? undefined,
    },
    bulkOrders: {
      available: Boolean(row.available_for_bulk_orders),
      minimumOrderQuantity: row.minimum_order_quantity ?? undefined,
      productionCapacity: row.production_capacity ?? undefined,
      leadTime: row.lead_time ?? undefined,
      deliveryArea: row.delivery_area ?? undefined,
    },
    bio: {
      ar: row.bio_ar,
      fr: row.bio_fr,
    },
    shortTagline: {
      ar: row.tagline_ar,
      fr: row.tagline_fr,
    },
    profilePhotoUrl: row.profile_photo_url ?? "/placeholders/provider-avatar.svg",
    gallery:
      row.provider_photos?.map((photo) => photo.url).filter((value): value is string => Boolean(value)) ?? [],
    galleryCaptions:
      row.provider_photos
        ?.map((photo) => photo.alt_text)
        .filter((value): value is string => Boolean(value)) ?? [],
    verification: {
      status: verification?.status ?? "pending",
      documentName: verification?.document_name ?? null,
      notes: stripProviderLifecycleTags(verification?.notes),
      ageConfirmed: verificationFlags.ageConfirmed,
      conductAccepted: verificationFlags.conductAccepted,
      policyAccepted: verificationFlags.policyAccepted,
      acceptedAt: verificationFlags.acceptedAt,
      conductVersion: verificationFlags.conductVersion,
      policyVersion: verificationFlags.policyVersion,
      rejectionReason: verificationFlags.rejectionReason,
      adminNote: verificationFlags.adminNote,
      managementToken: verificationFlags.managementToken,
      hasPassword: Boolean(verificationFlags.passwordHash && verificationFlags.passwordSalt),
    },
    availability:
      row.availability?.map((slot) => ({
        dayKey: slot.day_key,
        label: {
          ar: slot.label_ar ?? slot.day_key,
          fr: slot.label_fr ?? slot.day_key,
        },
        startTime: slot.start_time,
        endTime: slot.end_time,
      })) ?? [],
  };
}

function mapReviewRow(row: ReviewRow): Review {
  return {
    id: row.id,
    providerId: row.provider_id,
    bookingId: row.booking_id,
    customerName: row.customer_name,
    rating: row.rating,
    comment: row.review_text,
    status: row.status ?? "approved",
    adminNote: row.admin_note ?? null,
    createdAt: row.created_at,
  };
}

function mapBookingRow(row: BookingRow): Booking {
  return hydrateBookingLifecycle({
    id: row.id,
    providerId: row.provider_id,
    providerSlug: row.providers?.[0]?.slug ?? "",
    customerName: row.customer_name,
    phoneNumber: row.phone_number,
    selectedService: row.service_slug,
    date: row.booking_date,
    time: row.booking_time,
    zoneSlug: row.zone_slug,
    address: row.address,
    googleMapsUrl: row.google_maps_url,
    issueDescription: row.issue_description,
    preferredContactMethod: row.preferred_contact_method,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

function mapSupportMessageRow(row: SupportMessageRow): SupportMessage {
  return {
    id: row.id,
    caseId: row.support_case_id,
    authorRole: row.author_role,
    authorName: row.author_name,
    message: row.message,
    attachmentNames: row.attachment_names ?? [],
    createdAt: row.created_at,
  };
}

function mapSupportCaseRow(row: SupportCaseRow): SupportCase {
  const fallbackSafetyMeta = parseSupportMessageMetadata(row.message);

  return {
    id: row.id,
    actorRole: row.actor_role,
    category: row.issue_category,
    status: row.status,
    requestSafetyBlock: row.request_safety_block ?? fallbackSafetyMeta.requestSafetyBlock,
    privacySensitive: row.privacy_sensitive ?? fallbackSafetyMeta.privacySensitive,
    subject: row.subject,
    message: fallbackSafetyMeta.message,
    phoneNumber: row.phone_number ?? undefined,
    email: row.email ?? undefined,
    bookingId: row.booking_id ?? undefined,
    providerId: row.provider_id ?? undefined,
    providerSlug: row.provider_slug ?? undefined,
    attachmentNames: row.attachment_names ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    messages: (row.support_messages ?? []).map(mapSupportMessageRow),
  };
}

function mapBusinessRequestRow(row: BusinessRequestRow): BusinessRequest {
  return {
    id: row.id,
    companyName: row.company_name,
    contactName: row.contact_name,
    phone: row.phone,
    email: row.email ?? undefined,
    categorySlug: row.category_slug,
    description: row.description,
    wilayaSlug: row.wilaya_slug,
    frequency: row.frequency,
    timeline: row.timeline,
    budget: row.budget ?? undefined,
    preferredProviderType: row.preferred_provider_type,
    attachmentNames: row.attachment_names ?? [],
    status: row.status,
    matchedProviderIds: row.matched_provider_ids ?? [],
    adminNotes: row.admin_notes ?? undefined,
    consentAccepted: row.consent_accepted ?? true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function fetchSupabaseProviders() {
  if (!hasSupabaseServerEnv()) {
    return null;
  }

  const supabase = createServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const baseSelect = `
        id,
        slug,
        display_name,
        workshop_name,
        rating_average,
        review_count,
        completed_jobs_count,
        response_time_minutes,
        is_verified,
        approval_status,
        featured,
        years_experience,
        hourly_rate,
        travel_fee,
        phone_number,
        whatsapp_number,
        google_maps_url,
        bio_ar,
        bio_fr,
        tagline_ar,
        tagline_fr,
        profile_photo_url,
        provider_services ( category_slug ),
        service_areas ( zone_slug ),
        availability ( day_key, label_ar, label_fr, start_time, end_time ),
        provider_photos ( url, alt_text, sort_order ),
        provider_verifications ( status, document_name, notes )
      `;

  const { data, error } = await supabase
    .from("providers")
    .select(
      `
        id,
        slug,
        display_name,
        workshop_name,
        rating_average,
        review_count,
        completed_jobs_count,
        response_time_minutes,
        is_verified,
        approval_status,
        featured,
        years_experience,
        hourly_rate,
        travel_fee,
        phone_number,
        whatsapp_number,
        google_maps_url,
        facebook_url,
        instagram_url,
        tiktok_url,
        whatsapp_business_url,
        website_url,
        available_for_bulk_orders,
        minimum_order_quantity,
        production_capacity,
        lead_time,
        delivery_area,
        bio_ar,
        bio_fr,
        tagline_ar,
        tagline_fr,
        profile_photo_url,
        provider_services ( category_slug ),
        service_areas ( zone_slug ),
        availability ( day_key, label_ar, label_fr, start_time, end_time ),
        provider_photos ( url, alt_text, sort_order ),
        provider_verifications ( status, document_name, notes )
      `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    const { data: fallbackData, error: fallbackError } = await supabase.from("providers").select(baseSelect).order("created_at", { ascending: false });

    if (fallbackError) {
      return null;
    }

    return (fallbackData as ProviderRow[]).map(mapProviderRow);
  }

  return (data as ProviderRow[]).map(mapProviderRow);
}

async function fetchSupabaseReviews() {
  if (!hasSupabaseServerEnv()) {
    return null;
  }

  const supabase = createServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("reviews")
    .select("id, provider_id, booking_id, customer_name, rating, review_text, status, admin_note, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    const { data: fallbackData, error: fallbackError } = await supabase
      .from("reviews")
      .select("id, provider_id, booking_id, customer_name, rating, review_text, created_at")
      .order("created_at", { ascending: false });

    if (fallbackError) {
      return null;
    }

    return (fallbackData as ReviewRow[]).map(mapReviewRow);
  }

  return (data as ReviewRow[]).map(mapReviewRow);
}

async function fetchSupabaseBookings() {
  if (!hasSupabaseServerEnv()) {
    return null;
  }

  const supabase = createServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
        id,
        provider_id,
        customer_name,
        phone_number,
        service_slug,
        booking_date,
        booking_time,
        zone_slug,
        address,
        google_maps_url,
        issue_description,
        preferred_contact_method,
        status,
        created_at,
        updated_at,
        providers ( slug )
      `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    return null;
  }

  return (data as BookingRow[]).map(mapBookingRow);
}

async function fetchSupabaseSupportCases() {
  if (!hasSupabaseServerEnv()) {
    return null;
  }

  const supabase = createServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const baseSelect = `
        id,
        actor_role,
        issue_category,
        status,
        subject,
        message,
        phone_number,
        email,
        booking_id,
        provider_id,
        provider_slug,
        attachment_names,
        created_at,
        updated_at,
        support_messages (
          id,
          support_case_id,
          author_role,
          author_name,
          message,
          attachment_names,
          created_at
        )
      `;

  const { data, error } = await supabase
    .from("support_cases")
    .select(
      `
        id,
        actor_role,
        issue_category,
        status,
        request_safety_block,
        privacy_sensitive,
        subject,
        message,
        phone_number,
        email,
        booking_id,
        provider_id,
        provider_slug,
        attachment_names,
        created_at,
        updated_at,
        support_messages (
          id,
          support_case_id,
          author_role,
          author_name,
          message,
          attachment_names,
          created_at
        )
      `,
    )
    .order("updated_at", { ascending: false });

  if (error) {
    const { data: fallbackData, error: fallbackError } = await supabase
      .from("support_cases")
      .select(baseSelect)
      .order("updated_at", { ascending: false });

    if (fallbackError) {
      return null;
    }

    return (fallbackData as SupportCaseRow[]).map(mapSupportCaseRow);
  }

  return (data as SupportCaseRow[]).map(mapSupportCaseRow);
}

async function fetchSupabaseBusinessRequests() {
  if (!hasSupabaseServerEnv()) {
    return null;
  }

  const supabase = createServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("business_requests")
    .select(
      `
        id,
        company_name,
        contact_name,
        phone,
        email,
        category_slug,
        description,
        wilaya_slug,
        frequency,
        timeline,
        budget,
        preferred_provider_type,
        attachment_names,
        status,
        matched_provider_ids,
        admin_notes,
        consent_accepted,
        created_at,
        updated_at
      `,
    )
    .order("updated_at", { ascending: false });

  if (error) {
    return null;
  }

  return (data as BusinessRequestRow[]).map(mapBusinessRequestRow);
}

async function fetchSupabaseMetadata<Row>(table: "categories" | "zones") {
  if (!hasSupabaseServerEnv()) {
    return null;
  }

  const supabase = createServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase.from(table).select("*").order("sort_order", { ascending: true });

  if (error) {
    return null;
  }

  return data as Row[];
}

export async function getCategories() {
  const rows = await fetchSupabaseMetadata<{
    slug: string;
    icon: string | null;
    lane?: ProfileType | null;
    name_ar: string;
    name_fr: string;
    description_ar: string | null;
    description_fr: string | null;
  }>("categories");

  const mapped = rows?.map((row) => ({
    slug: row.slug,
    lane: row.lane ?? categoryDetailsBySlug.get(row.slug)?.lane ?? "service_provider",
    icon: row.icon ?? "🧰",
    name: {
      ar: row.name_ar,
      fr: row.name_fr,
    },
    description: {
      ar: row.description_ar ?? row.name_ar,
      fr: row.description_fr ?? row.name_fr,
    },
  })) ?? [];

  return [...mapped, ...seedCategories.filter((seed) => !mapped.some((row) => row.slug === seed.slug))];
}

export async function getZones() {
  const rows = await fetchSupabaseMetadata<{
    slug: string;
    province_slug?: string | null;
    wilaya: string;
    name_ar: string;
    name_fr: string;
  }>("zones");

  const mapped = rows?.map((row) => ({
    slug: row.slug,
    provinceSlug:
      row.province_slug ??
      zoneDetailsBySlug.get(row.slug)?.provinceSlug ??
      row.wilaya.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-"),
    provinceName:
      zoneDetailsBySlug.get(row.slug)?.provinceName ??
      getProvinceName(
        row.province_slug ??
          row.wilaya.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-"),
      ),
    wilaya: row.wilaya,
    name: {
      ar: row.name_ar,
      fr: row.name_fr,
    },
    coordinates: getZoneCoordinates(row.slug),
  })) ?? [];

  return [...mapped, ...seedZones.filter((seed) => !mapped.some((row) => row.slug === seed.slug))];
}

export async function getProviders(filters: Filters = {}, includeAllStatuses = false) {
  const resolvedProviders = hasSupabaseServerEnv()
    ? ((await fetchSupabaseProviders()) ?? [])
    : listDemoProviders();
  const mergedProviders = hasSupabaseServerEnv()
    ? [
        ...resolvedProviders,
        ...seedProviders.filter((seed) => !resolvedProviders.some((provider) => provider.slug === seed.slug)),
      ]
    : resolvedProviders;
  const visibleProviders = includeAllStatuses
    ? mergedProviders
    : mergedProviders.filter((provider) => provider.status === "approved");
  return applyProviderFilters(visibleProviders, filters);
}

export async function getFeaturedProviders(profileType: ProfileType = "service_provider") {
  const providers = await getProviders({ sort: "top", profileType });
  return providers.filter((provider) => provider.featured).slice(0, 4);
}

export async function getProviderBySlug(slug: string, includePending = false) {
  if (!hasSupabaseServerEnv()) {
    const provider = findDemoProviderBySlug(slug);

    if (!provider) {
      return null;
    }

    if (!includePending && provider.status !== "approved") {
      return null;
    }

    return provider;
  }

  const providers = await getProviders({}, includePending);
  return providers.find((provider) => provider.slug === slug) ?? null;
}

export async function getProviderById(id: string, includePending = false) {
  if (!hasSupabaseServerEnv()) {
    const provider = findDemoProvider(id);

    if (!provider) {
      return null;
    }

    if (!includePending && provider.status !== "approved") {
      return null;
    }

    return provider;
  }

  const providers = await getProviders({}, includePending);
  return providers.find((provider) => provider.id === id) ?? null;
}

export async function getReviews(providerId?: string, options?: { includeAllStatuses?: boolean }) {
  const reviews = (await fetchSupabaseReviews()) ?? listDemoReviews(true);
  const visibleReviews = options?.includeAllStatuses ? reviews : reviews.filter((review) => review.status === "approved");

  if (!providerId) {
    return visibleReviews;
  }

  return visibleReviews.filter((review) => review.providerId === providerId);
}

export async function getBookings() {
  return (await fetchSupabaseBookings()) ?? listDemoBookings();
}

export async function getSupportCases() {
  return (await fetchSupabaseSupportCases()) ?? listDemoSupportCases();
}

export async function getBusinessRequests() {
  return (await fetchSupabaseBusinessRequests()) ?? listDemoBusinessRequests();
}

export async function getSupportCaseById(id: string) {
  if (!hasSupabaseServerEnv()) {
    return findDemoSupportCase(id);
  }

  const items = await getSupportCases();
  return items.find((item) => item.id === id) ?? null;
}

export async function getBusinessRequestById(id: string) {
  if (!hasSupabaseServerEnv()) {
    return findDemoBusinessRequest(id);
  }

  const items = await getBusinessRequests();
  return items.find((item) => item.id === id) ?? null;
}

export async function getBookingById(id: string) {
  if (!hasSupabaseServerEnv()) {
    return findDemoBooking(id);
  }

  const items = await getBookings();
  return items.find((booking) => booking.id === id) ?? null;
}

export async function getBookingsForProvider(providerId: string) {
  const items = await getBookings();
  return items
    .filter((booking) => booking.providerId === providerId)
    .sort((left, right) => `${right.date}T${right.time}`.localeCompare(`${left.date}T${left.time}`));
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const [providers, bookings, reviews, supportCases, businessRequests, categories, zones] = await Promise.all([
    getProviders({}, true),
    getBookings(),
    getReviews(undefined, { includeAllStatuses: true }),
    getSupportCases(),
    getBusinessRequests(),
    getCategories(),
    getZones(),
  ]);

  return {
    providers,
    bookings,
    reviews,
    supportCases,
    businessRequests,
    categories,
    zones,
  };
}

export async function getSearchSummary() {
  const [providers, categories, zones] = await Promise.all([
    getProviders(),
    getCategories(),
    getZones(),
  ]);

  return {
    providersCount: providers.length,
    categoriesCount: categories.length,
    zonesCount: zones.length,
  };
}

export async function getCategoryMap() {
  const categories = await getCategories();
  return new Map(categories.map((category) => [category.slug, category]));
}

export async function getZoneMap() {
  const zones = await getZones();
  return new Map(zones.map((zone) => [zone.slug, zone]));
}

export function getLocalizedBookingSummary(booking: Booking) {
  return `${booking.customerName} • ${formatDate(booking.date, defaultLocale)} • ${booking.time}`;
}

export function getCategoryBySlug(categories: Category[], slug: string | undefined) {
  return categories.find((category) => category.slug === slug) ?? null;
}

export function getZoneBySlug(zones: Zone[], slug: string | undefined) {
  return zones.find((zone) => zone.slug === slug) ?? null;
}
