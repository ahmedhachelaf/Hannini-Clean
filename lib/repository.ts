import { bookings as seedBookings, categories as seedCategories, providers as seedProviders, reviews as seedReviews, zones as seedZones } from "@/data/seed";
import { formatDate } from "@/lib/format";
import { defaultLocale } from "@/lib/i18n";
import { getProviderScore } from "@/lib/ranking";
import { createServerSupabaseClient, hasSupabaseServerEnv } from "@/lib/supabase/server";
import type { AdminDashboardData, Booking, Category, Filters, MapCoordinates, Provider, ProviderStatus, Review, SortOption, Zone } from "@/lib/types";

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
  approval_status: Provider["status"];
  featured: boolean | null;
  years_experience: number | null;
  hourly_rate: number | null;
  travel_fee: number | null;
  phone_number: string;
  whatsapp_number: string;
  google_maps_url: string;
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
  providers?: Array<{
    slug: string;
  }> | null;
};

const fallbackCoordinatesByZone: Record<string, MapCoordinates> = Object.fromEntries(
  seedZones.map((zone) => [zone.slug, zone.coordinates]),
);

function getZoneCoordinates(zoneSlug: string | undefined) {
  if (!zoneSlug) {
    return { latitude: 35.6981, longitude: -0.6348 };
  }

  return fallbackCoordinatesByZone[zoneSlug] ?? { latitude: 35.6981, longitude: -0.6348 };
}

function deriveProviderStatus(
  approvalStatus: ProviderStatus,
  verificationNotes: string | null | undefined,
) {
  if (verificationNotes?.includes("[needs_more_info]")) {
    return "needs_more_info" as const;
  }

  return approvalStatus;
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
    if (filters.category && provider.categorySlug !== filters.category) {
      return false;
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
  const derivedStatus = deriveProviderStatus(row.approval_status, verification?.notes);

  return {
    id: row.id,
    slug: row.slug,
    displayName: row.display_name,
    workshopName: row.workshop_name,
    categorySlug: row.provider_services?.[0]?.category_slug ?? "handyman",
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
    verification: {
      status: verification?.status ?? "pending",
      documentName: verification?.document_name ?? null,
      notes: verification?.notes ?? null,
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
    createdAt: row.created_at,
  };
}

function mapBookingRow(row: BookingRow): Booking {
  return {
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
    return null;
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
    .select("id, provider_id, booking_id, customer_name, rating, review_text, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return null;
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
        providers ( slug )
      `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    return null;
  }

  return (data as BookingRow[]).map(mapBookingRow);
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
    name_ar: string;
    name_fr: string;
    description_ar: string | null;
    description_fr: string | null;
  }>("categories");

  const mapped = rows?.map((row) => ({
    slug: row.slug,
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
    wilaya: string;
    name_ar: string;
    name_fr: string;
  }>("zones");

  const mapped = rows?.map((row) => ({
    slug: row.slug,
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
  const supabaseProviders = (await fetchSupabaseProviders()) ?? [];
  const providers = [...supabaseProviders, ...seedProviders.filter((seed) => !supabaseProviders.some((provider) => provider.slug === seed.slug))];
  const visibleProviders = includeAllStatuses
    ? providers
    : providers.filter((provider) => provider.status === "approved");
  return applyProviderFilters(visibleProviders, filters);
}

export async function getFeaturedProviders() {
  const providers = await getProviders({ sort: "top" });
  return providers.filter((provider) => provider.featured).slice(0, 4);
}

export async function getProviderBySlug(slug: string, includePending = false) {
  const providers = await getProviders({}, includePending);
  return providers.find((provider) => provider.slug === slug) ?? null;
}

export async function getProviderById(id: string, includePending = false) {
  const providers = await getProviders({}, includePending);
  return providers.find((provider) => provider.id === id) ?? null;
}

export async function getReviews(providerId?: string) {
  const reviews = (await fetchSupabaseReviews()) ?? seedReviews;

  if (!providerId) {
    return reviews;
  }

  return reviews.filter((review) => review.providerId === providerId);
}

export async function getBookings() {
  return (await fetchSupabaseBookings()) ?? seedBookings;
}

export async function getBookingById(id: string) {
  const items = await getBookings();
  return items.find((booking) => booking.id === id) ?? null;
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const [providers, bookings, reviews, categories, zones] = await Promise.all([
    getProviders({}, true),
    getBookings(),
    getReviews(),
    getCategories(),
    getZones(),
  ]);

  return {
    providers,
    bookings,
    reviews,
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
