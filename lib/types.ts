export type Locale = "ar" | "fr";

export type SortOption = "top" | "rating" | "response" | "jobs";

export type ProviderStatus = "approved" | "pending" | "rejected";

export type ContactMethod = "whatsapp" | "phone";

export type Category = {
  slug: string;
  icon: string;
  name: Record<Locale, string>;
  description: Record<Locale, string>;
};

export type Zone = {
  slug: string;
  wilaya: string;
  name: Record<Locale, string>;
};

export type AvailabilitySlot = {
  dayKey: string;
  label: Record<Locale, string>;
  startTime: string;
  endTime: string;
};

export type Review = {
  id: string;
  providerId: string;
  bookingId: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type Provider = {
  id: string;
  slug: string;
  displayName: string;
  workshopName?: string | null;
  categorySlug: string;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  responseTimeMinutes: number;
  isVerified: boolean;
  status: ProviderStatus;
  featured: boolean;
  yearsExperience: number;
  hourlyRate: number;
  travelFee: number;
  zones: string[];
  languages: string[];
  phoneNumber: string;
  whatsappNumber: string;
  googleMapsUrl: string;
  bio: Record<Locale, string>;
  shortTagline: Record<Locale, string>;
  profilePhotoUrl: string;
  gallery: string[];
  availability: AvailabilitySlot[];
};

export type Booking = {
  id: string;
  providerId: string;
  providerSlug: string;
  customerName: string;
  phoneNumber: string;
  selectedService: string;
  date: string;
  time: string;
  zoneSlug: string;
  address: string;
  googleMapsUrl: string;
  issueDescription: string;
  preferredContactMethod: ContactMethod;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: string;
};

export type ProviderSignupInput = {
  fullName: string;
  workshopName: string;
  phoneNumber: string;
  whatsappNumber: string;
  categorySlug: string;
  zones: string[];
  hourlyRate: number;
  travelFee: number;
  yearsExperience: number;
  shortDescription: string;
  languages: string[];
  googleMapsUrl: string;
  weekdays: string[];
  startTime: string;
  endTime: string;
  profilePhotoName?: string;
  workPhotoNames: string[];
  verificationDocumentName?: string;
};

export type BookingInput = {
  providerId: string;
  providerSlug: string;
  customerName: string;
  phoneNumber: string;
  selectedService: string;
  date: string;
  time: string;
  zoneSlug: string;
  address: string;
  googleMapsUrl: string;
  issueDescription: string;
  preferredContactMethod: ContactMethod;
};

export type ReviewInput = {
  bookingId: string;
  providerId: string;
  customerName: string;
  rating: number;
  comment: string;
};

export type BookingSubmissionResult = {
  ok: boolean;
  message: string;
  whatsappUrl?: string;
  bookingId?: string;
  demoMode?: boolean;
};

export type SignupSubmissionResult = {
  ok: boolean;
  message: string;
  providerId?: string;
  demoMode?: boolean;
};

export type ReviewSubmissionResult = {
  ok: boolean;
  message: string;
  demoMode?: boolean;
};

export type Filters = {
  category?: string;
  zone?: string;
  query?: string;
  sort?: SortOption;
};

export type AdminDashboardData = {
  providers: Provider[];
  bookings: Booking[];
  reviews: Review[];
  categories: Category[];
  zones: Zone[];
};
