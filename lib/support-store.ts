import { supportCases as seedSupportCases } from "@/data/seed";
import type { SupportCase, SupportMessage, SupportStatus } from "@/lib/types";

function cloneSeedCases() {
  return JSON.parse(JSON.stringify(seedSupportCases)) as SupportCase[];
}

const demoSupportCases = cloneSeedCases();

export function listDemoSupportCases() {
  return demoSupportCases;
}

export function findDemoSupportCase(id: string) {
  return demoSupportCases.find((item) => item.id === id) ?? null;
}

export function createDemoSupportCase(input: Omit<SupportCase, "id" | "createdAt" | "updatedAt" | "messages">) {
  const timestamp = new Date().toISOString();
  const nextCase: SupportCase = {
    ...input,
    id: `support-case-${Date.now().toString(36)}`,
    createdAt: timestamp,
    updatedAt: timestamp,
    messages: [],
  };

  demoSupportCases.unshift(nextCase);
  return nextCase;
}

export function appendDemoSupportMessage(caseId: string, message: Omit<SupportMessage, "id" | "createdAt" | "caseId">) {
  const supportCase = findDemoSupportCase(caseId);

  if (!supportCase) {
    return null;
  }

  const nextMessage: SupportMessage = {
    ...message,
    id: `support-message-${Date.now().toString(36)}`,
    caseId,
    createdAt: new Date().toISOString(),
  };

  supportCase.messages.push(nextMessage);
  supportCase.updatedAt = nextMessage.createdAt;
  return supportCase;
}

export function updateDemoSupportStatus(caseId: string, status: SupportStatus) {
  const supportCase = findDemoSupportCase(caseId);

  if (!supportCase) {
    return null;
  }

  supportCase.status = status;
  supportCase.updatedAt = new Date().toISOString();
  return supportCase;
}
