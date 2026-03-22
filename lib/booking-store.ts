import { bookings as seedBookings } from "@/data/seed";
import { hydrateBookingLifecycle } from "@/lib/booking-lifecycle";
import type { Booking, BookingInput } from "@/lib/types";

function cloneSeedBookings() {
  return JSON.parse(JSON.stringify(seedBookings)) as Booking[];
}

const demoBookings = cloneSeedBookings();

function findBookingIndex(id: string) {
  return demoBookings.findIndex((booking) => booking.id === id);
}

export function listDemoBookings() {
  return demoBookings.map((booking) => hydrateBookingLifecycle(booking));
}

export function findDemoBooking(id: string) {
  const booking = demoBookings.find((item) => item.id === id) ?? null;
  return booking ? hydrateBookingLifecycle(booking) : null;
}

export function createDemoBooking(
  input: BookingInput,
  extras: {
    issueDescription: string;
    customerAccessToken: string;
  },
) {
  const booking: Booking = {
    id: `booking-${Date.now().toString(36)}`,
    providerId: input.providerId,
    providerSlug: input.providerSlug,
    customerName: input.customerName,
    phoneNumber: input.phoneNumber,
    selectedService: input.selectedService,
    date: input.date,
    time: input.time,
    zoneSlug: input.zoneSlug,
    address: input.address,
    googleMapsUrl: input.googleMapsUrl,
    issueDescription: extras.issueDescription,
    preferredContactMethod: input.preferredContactMethod,
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    customerAccessToken: extras.customerAccessToken,
  };

  demoBookings.unshift(booking);
  return hydrateBookingLifecycle(booking);
}

export function updateDemoBooking(
  bookingId: string,
  providerId: string,
  patch: Partial<Booking>,
) {
  const index = findBookingIndex(bookingId);

  if (index < 0) {
    return null;
  }

  const current = demoBookings[index];

  if (current.providerId !== providerId) {
    return null;
  }

  demoBookings[index] = {
    ...current,
    ...patch,
    updatedAt: patch.updatedAt ?? new Date().toISOString(),
  };

  return hydrateBookingLifecycle(demoBookings[index]);
}

export function findDemoBookingByAccessToken(id: string, token: string) {
  const booking = demoBookings.find((item) => item.id === id && hydrateBookingLifecycle(item).customerAccessToken === token) ?? null;
  return booking ? hydrateBookingLifecycle(booking) : null;
}
