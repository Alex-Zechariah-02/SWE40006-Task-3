import type { NormalizedResult } from "@/types/search";

export const PENDING_IMPORT_KEY = "careerdeck.pendingOpportunityImport.v1";

type PendingImportEnvelopeV1 = {
  v: 1;
  savedAt: string;
  payload: NormalizedResult;
};

export function writePendingImport(payload: NormalizedResult) {
  try {
    const envelope: PendingImportEnvelopeV1 = {
      v: 1,
      savedAt: new Date().toISOString(),
      payload,
    };

    sessionStorage.setItem(PENDING_IMPORT_KEY, JSON.stringify(envelope));
  } catch {
    // Best-effort only. The save-intent flow is helpful, but not a security boundary.
  }
}

export function readPendingImport(): PendingImportEnvelopeV1 | null {
  try {
    const raw = sessionStorage.getItem(PENDING_IMPORT_KEY);
    if (!raw) return null;

    const json: unknown = JSON.parse(raw);
    if (typeof json !== "object" || json === null) return null;
    if (!("v" in json) || (json as { v?: unknown }).v !== 1) return null;
    if (!("payload" in json)) return null;

    return json as PendingImportEnvelopeV1;
  } catch {
    return null;
  }
}

export function clearPendingImport() {
  try {
    sessionStorage.removeItem(PENDING_IMPORT_KEY);
  } catch {
    // ignore
  }
}

