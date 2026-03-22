export type Locale = "ar" | "fr";

export type SortOption = "top" | "rating" | "response" | "jobs";

export type ProviderStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "needs_more_info"
  | "suspended"
  | "deactivated_by_provider"
  | "pending_deletion"
  | "deleted";

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

export type BusinessRequestStatus = "new" | "under_review" | "matched" | "closed" | "rejected";

export type BusinessRequestFrequency = "one_time" | "recurring";

export type BusinessPreferredProviderType = ProfileType | "either";

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

export type SocialLinks = {
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  whatsappBusiness?: string;
  website?: string;
};

export type BulkOrderProfile = {
  available: boolean;
  minimumOrderQuantity?: string;
  productionCapacity?: string;
  leadTime?: string;
  deliveryArea?: string;
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
  socialLinks?: SocialLinks;
  bulkOrders?: BulkOrderProfile;
  availability: AvailabilitySlot[];
  verification: {
    status: "pending" | "verified" | "rejected";
    documentName?: string | null;
    notes?: string | null;
    ageConfirmed?: boolean;
    conductAccepted?: boolean;
    policyAccepted?: boolean;
    acceptedAt?: string | null;
    conductVersion?: string | null;
    policyVersion?: string | null;
    rejectionReason?: string | null;
    adminNote?: string | null;
    managementToken?: string | null;
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
  isBusinessBuyer?: boolean;
  quantityNeeded?: string;
  productionNeed?: string;
  requestedLeadTime?: string;
  deliveryAreaNeeded?: string;
  providerNote?: string;
  proposedDate?: string;
  proposedTime?: string;
  customerAccessToken?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: string;
  updatedAt?: string;
};

export type ProviderSession = {
  providerId: string;
  token: string;
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

export type BusinessRequest = {
  id: string;
  companyName: string;
  contactName: string;
  phone: string;
  email?: string;
  categorySlug: string;
  description: string;
  wilayaSlug: string;
  frequency: BusinessRequestFrequency;
  timeline: string;
  budget?: string;
  preferredProviderType: BusinessPreferredProviderType;
  attachmentNames: string[];
  status: BusinessRequestStatus;
  matchedProviderIds: string[];
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  consentAccepted: boolean;
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
  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  whatsappBusinessUrl?: string;
  websiteUrl?: string;
  availableForBulkOrders?: boolean;
  minimumOrderQuantity?: string;
  productionCapacity?: string;
  leadTime?: string;
  deliveryArea?: string;
  ageConfirmed: boolean;
  conductAccepted: boolean;
  policyAccepted: boolean;
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
  isBusinessBuyer?: boolean;
  quantityNeeded?: string;
  productionNeed?: string;
  requestedLeadTime?: string;
  deliveryAreaNeeded?: string;
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

export type BusinessRequestInput = {
  companyName: string;
  contactName: string;
  phone: string;
  email?: string;
  categorySlug: string;
  description: string;
  wilayaSlug: string;
  frequency: BusinessRequestFrequency;
  timeline: string;
  budget?: string;
  preferredProviderType: BusinessPreferredProviderType;
  attachmentNames: string[];
  consentAccepted: boolean;
};

export type BookingSubmissionResult = {
  ok: boolean;
  message: string;
  whatsappUrl?: string;
  bookingId?: string;
  statusUrl?: string;
  demoMode?: boolean;
};

export type SignupSubmissionResult = {
  ok: boolean;
  message: string;
  providerId?: string;
  providerSlug?: string;
  manageUrl?: string;
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

export type BusinessRequestSubmissionResult = {
  ok: boolean;
  message: string;
  requestId?: string;
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
  businessRequests: BusinessRequest[];
  categories: Category[];
  zones: Zone[];
};
