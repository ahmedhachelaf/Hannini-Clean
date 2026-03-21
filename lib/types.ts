export type Locale = "ar" | "fr";

export type SortOption = "top" | "rating" | "response" | "jobs";

export type ProviderStatus = "approved" | "pending" | "rejected" | "needs_more_info";

export type ProfileType = "service_provider" | "home_business";

export type ContactMethod = "whatsapp" | "phone";

export type MapCoordinates = {
  latitude: number;
  longitude: number;
};

export type Category = {
  slug: string;
  lane: ProfileType;
  icon: string;
  name: Record<Locale, string>;
  description: Record<Locale, string>;
};

export type Zone = {
  slug: string;
  provinceSlug: string;
  provinceName: Record<Locale, string>;
  wilaya: string;
  name: Record<Locale, string>;
  coordinates: MapCoordinates;
};

export type SupportActor = "customer" | "provider";

export type SupportStatus = "open" | "in_review" | "waiting_for_user" | "resolved";

export type SupportCategory =
  | "booking_issue"
  | "provider_report"
  | "harassment"
  | "unsafe_behavior"
  | "fraud_or_scam"
  | "inappropriate_contact"
  | "misconduct"
  | "payment_question"
  | "account_help"
  | "technical_issue"
  | "general_support";

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
  profileType: ProfileType;
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
  coordinates: MapCoordinates;
  languages: string[];
  phoneNumber: string;
  whatsappNumber: string;
  googleMapsUrl: string;
  bio: Record<Locale, string>;
  shortTagline: Record<Locale, string>;
  profilePhotoUrl: string;
  gallery: string[];
  galleryCaptions?: string[];
  availability: AvailabilitySlot[];
  verification: {
    status: "pending" | "verified" | "rejected";
    documentName?: string | null;
    notes?: string | null;
  };
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
  notificationRequested?: boolean;
  issuePhotoNames?: string[];
  preferredContactMethod: ContactMethod;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: string;
};

export type SupportMessage = {
  id: string;
  caseId: string;
  authorRole: SupportActor | "admin";
  authorName: string;
  message: string;
  attachmentNames: string[];
  createdAt: string;
};

export type SupportCase = {
  id: string;
  actorRole: SupportActor;
  category: SupportCategory;
  status: SupportStatus;
  requestSafetyBlock?: boolean;
  privacySensitive?: boolean;
  subject: string;
  message: string;
  phoneNumber?: string;
  email?: string;
  bookingId?: string;
  providerId?: string;
  providerSlug?: string;
  attachmentNames: string[];
  createdAt: string;
  updatedAt: string;
  messages: SupportMessage[];
};

export type ProviderSignupInput = {
  profileType: ProfileType;
  fullName: string;
  workshopName: string;
  phoneNumber: string;
  whatsappNumber: string;
  categorySlug: string;
  zones: string[];
  hourlyRate?: number;
  travelFee?: number;
  yearsExperience?: number;
  shortDescription: string;
  languages: string[];
  googleMapsUrl?: string;
  weekdays?: string[];
  startTime?: string;
  endTime?: string;
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
  notificationRequested: boolean;
  issuePhotoNames: string[];
  preferredContactMethod: ContactMethod;
};

export type ReviewInput = {
  bookingId: string;
  providerId: string;
  customerName: string;
  rating: number;
  comment: string;
};

export type SupportCaseInput = {
  actorRole: SupportActor;
  category: SupportCategory;
  requestSafetyBlock?: boolean;
  privacySensitive?: boolean;
  subject: string;
  message: string;
  phoneNumber?: string;
  email?: string;
  bookingId?: string;
  providerId?: string;
  providerSlug?: string;
  attachmentNames: string[];
};

export type SupportReplyInput = {
  caseId: string;
  authorRole: SupportActor | "admin";
  authorName: string;
  message: string;
  attachmentNames: string[];
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
  providerSlug?: string;
  demoMode?: boolean;
};

export type ReviewSubmissionResult = {
  ok: boolean;
  message: string;
  demoMode?: boolean;
};

export type SupportSubmissionResult = {
  ok: boolean;
  message: string;
  caseId?: string;
  demoMode?: boolean;
};

export type Filters = {
  profileType?: ProfileType;
  category?: string;
  province?: string;
  zone?: string;
  query?: string;
  sort?: SortOption;
};

export type AdminDashboardData = {
  providers: Provider[];
  bookings: Booking[];
  reviews: Review[];
  supportCases: SupportCase[];
  categories: Category[];
  zones: Zone[];
};
