import type { APIRequestContext } from "@playwright/test";

async function readJsonSafe(res: { json: () => Promise<unknown> }) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function createCompany(
  request: APIRequestContext,
  data: { name: string; industry?: string; location?: string; website?: string; generalNotes?: string }
) {
  const res = await request.post("/api/companies", { data });
  const json = (await readJsonSafe(res)) as { company?: { id?: string } } | null;
  const id = json?.company?.id;
  if (!res.ok() || !id) {
    throw new Error(`createCompany failed: status=${res.status()} body=${JSON.stringify(json)}`);
  }
  return id;
}

export async function createContact(
  request: APIRequestContext,
  data: {
    companyId: string;
    name: string;
    title?: string;
    email?: string;
    phone?: string;
    linkedinUrl?: string;
    notes?: string;
  }
) {
  const res = await request.post("/api/contacts", { data });
  const json = (await readJsonSafe(res)) as { contact?: { id?: string } } | null;
  const id = json?.contact?.id;
  if (res.status() !== 201 || !id) {
    throw new Error(`createContact failed: status=${res.status()} body=${JSON.stringify(json)}`);
  }
  return id;
}

export async function deleteContact(request: APIRequestContext, contactId: string) {
  const res = await request.delete(`/api/contacts/${encodeURIComponent(contactId)}`);
  if (!res.ok()) {
    const json = await readJsonSafe(res);
    throw new Error(`deleteContact failed: status=${res.status()} body=${JSON.stringify(json)}`);
  }
}

export async function createManualOpportunity(
  request: APIRequestContext,
  data: {
    title: string;
    companyName: string;
    opportunityType: string;
    remoteMode: string;
    location?: string;
    sourceUrl?: string;
    deadline?: string;
    tags?: string[];
  }
) {
  const res = await request.post("/api/opportunities", { data });
  const json = (await readJsonSafe(res)) as { opportunity?: { id?: string } } | null;
  const id = json?.opportunity?.id;
  if (!res.ok() || !id) {
    throw new Error(`createManualOpportunity failed: status=${res.status()} body=${JSON.stringify(json)}`);
  }
  return id;
}

export async function archiveOpportunity(request: APIRequestContext, opportunityId: string) {
  await request.patch(`/api/opportunities/${encodeURIComponent(opportunityId)}`, {
    data: { action: "archive" },
  });
}

export async function convertOpportunityToApplication(
  request: APIRequestContext,
  data: { opportunityId: string; priority: string; tags?: string[] }
) {
  const res = await request.post("/api/applications", { data });
  const json = (await readJsonSafe(res)) as
    | { application?: { id?: string }; created?: boolean; existingApplicationId?: string }
    | null;

  if (res.status() === 409) {
    const existingApplicationId = json?.existingApplicationId;
    if (!existingApplicationId) {
      throw new Error(`convertOpportunityToApplication expected existingApplicationId: body=${JSON.stringify(json)}`);
    }
    return { status: 409 as const, existingApplicationId };
  }

  const id = json?.application?.id;
  if (!res.ok() || !id) {
    throw new Error(`convertOpportunityToApplication failed: status=${res.status()} body=${JSON.stringify(json)}`);
  }
  return { status: res.status() as 200 | 201, applicationId: id };
}

export async function archiveApplication(request: APIRequestContext, applicationId: string) {
  await request.patch(`/api/applications/${encodeURIComponent(applicationId)}`, {
    data: { action: "archive" },
  });
}

export async function patchApplication(
  request: APIRequestContext,
  applicationId: string,
  data: Record<string, unknown>
) {
  const res = await request.patch(`/api/applications/${encodeURIComponent(applicationId)}`, { data });
  const json = await readJsonSafe(res);
  return { res, json };
}

export async function createOfferDetail(
  request: APIRequestContext,
  applicationId: string,
  data: { decisionStatus: string; offeredDate?: string; responseDeadline?: string; compensationNote?: string; notes?: string }
) {
  const res = await request.post(`/api/applications/${encodeURIComponent(applicationId)}/offer`, { data });
  if (res.status() !== 201) {
    const json = await readJsonSafe(res);
    throw new Error(`createOfferDetail failed: status=${res.status()} body=${JSON.stringify(json)}`);
  }
}

export async function deleteOfferDetail(request: APIRequestContext, applicationId: string) {
  const res = await request.delete(`/api/applications/${encodeURIComponent(applicationId)}/offer`);
  if (!res.ok()) {
    const json = await readJsonSafe(res);
    throw new Error(`deleteOfferDetail failed: status=${res.status()} body=${JSON.stringify(json)}`);
  }
}

export async function createRejectionDetail(
  request: APIRequestContext,
  applicationId: string,
  data: { rejectedAtStage: string; rejectionDate?: string; notes?: string }
) {
  const res = await request.post(`/api/applications/${encodeURIComponent(applicationId)}/rejection`, { data });
  if (res.status() !== 201) {
    const json = await readJsonSafe(res);
    throw new Error(`createRejectionDetail failed: status=${res.status()} body=${JSON.stringify(json)}`);
  }
}

export async function deleteRejectionDetail(request: APIRequestContext, applicationId: string) {
  const res = await request.delete(`/api/applications/${encodeURIComponent(applicationId)}/rejection`);
  if (!res.ok()) {
    const json = await readJsonSafe(res);
    throw new Error(`deleteRejectionDetail failed: status=${res.status()} body=${JSON.stringify(json)}`);
  }
}

export async function createActionItem(
  request: APIRequestContext,
  data: { title: string; priority: string; status: string; dueAt?: string; companyId?: string; opportunityId?: string; applicationId?: string; interviewId?: string }
) {
  const res = await request.post("/api/actions", { data });
  const json = (await readJsonSafe(res)) as { actionItem?: { id?: string } } | null;
  const id = json?.actionItem?.id;
  if (res.status() !== 201 || !id) {
    throw new Error(`createActionItem failed: status=${res.status()} body=${JSON.stringify(json)}`);
  }
  return id;
}

export async function deleteActionItem(request: APIRequestContext, actionItemId: string) {
  const res = await request.delete(`/api/actions/${encodeURIComponent(actionItemId)}`);
  if (!res.ok()) {
    const json = await readJsonSafe(res);
    throw new Error(`deleteActionItem failed: status=${res.status()} body=${JSON.stringify(json)}`);
  }
}

