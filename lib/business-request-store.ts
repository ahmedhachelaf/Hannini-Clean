import { businessRequests as seedBusinessRequests } from "@/data/seed";
import type { BusinessRequest, BusinessRequestStatus } from "@/lib/types";

function cloneSeedRequests() {
  return JSON.parse(JSON.stringify(seedBusinessRequests)) as BusinessRequest[];
}

const demoBusinessRequests = cloneSeedRequests();

export function listDemoBusinessRequests() {
  return demoBusinessRequests;
}

export function findDemoBusinessRequest(id: string) {
  return demoBusinessRequests.find((item) => item.id === id) ?? null;
}

export function createDemoBusinessRequest(input: Omit<BusinessRequest, "id" | "createdAt" | "updatedAt">) {
  const timestamp = new Date().toISOString();
  const nextRequest: BusinessRequest = {
    ...input,
    id: `business-request-${Date.now().toString(36)}`,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  demoBusinessRequests.unshift(nextRequest);
  return nextRequest;
}

export function updateDemoBusinessRequest(
  id: string,
  input: {
    status: BusinessRequestStatus;
    matchedProviderIds: string[];
    adminNotes?: string;
  },
) {
  const businessRequest = findDemoBusinessRequest(id);

  if (!businessRequest) {
    return null;
  }

  businessRequest.status = input.status;
  businessRequest.matchedProviderIds = input.matchedProviderIds;
  businessRequest.adminNotes = input.adminNotes ?? "";
  businessRequest.updatedAt = new Date().toISOString();
  return businessRequest;
}
