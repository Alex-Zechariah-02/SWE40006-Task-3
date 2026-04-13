import { NextResponse } from "next/server";

import { requireUserOrResponse } from "@/lib/api/auth";
import { readJsonOrResponse } from "@/lib/api/json";
import { validateOrResponse } from "@/lib/api/validation";
import { companyUpdateSchema } from "@/lib/validation/company";
import {
  updateCompany,
  archiveCompany,
  unarchiveCompany,
  deleteCompany,
  CompanyHasLinkedRecordsError,
} from "@/lib/db/companies";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  const authed = await requireUserOrResponse();
  if (!authed.ok) return authed.response;

  const { id } = await context.params;

  const body = await readJsonOrResponse(req);
  if (!body.ok) return body.response;
  const json = body.json;
  const actionBody = json as Record<string, unknown>;

  if (actionBody.action === "archive") {
    try {
      await archiveCompany(id, authed.user.id);
      return NextResponse.json({ archived: true });
    } catch {
      return NextResponse.json(
        { error: { message: "Company not found." } },
        { status: 404 }
      );
    }
  }

  if (actionBody.action === "unarchive") {
    try {
      await unarchiveCompany(id, authed.user.id);
      return NextResponse.json({ archived: false });
    } catch {
      return NextResponse.json(
        { error: { message: "Company not found." } },
        { status: 404 }
      );
    }
  }

  const parsed = validateOrResponse(companyUpdateSchema, json, {
    message: "Validation failed.",
    includeFieldErrors: true,
  });
  if (!parsed.ok) return parsed.response;

  try {
    const updated = await updateCompany(id, authed.user.id, {
      name: parsed.data.name,
      website: parsed.data.website === "" ? null : parsed.data.website,
      location: parsed.data.location,
      industry: parsed.data.industry,
      techStackNotes: parsed.data.techStackNotes,
      applicationProcessNotes: parsed.data.applicationProcessNotes,
      interviewNotes: parsed.data.interviewNotes,
      compensationNotes: parsed.data.compensationNotes,
      generalNotes: parsed.data.generalNotes,
    });
    return NextResponse.json({ company: updated });
  } catch {
    return NextResponse.json(
      { error: { message: "Company not found or update failed." } },
      { status: 404 }
    );
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  const authed = await requireUserOrResponse();
  if (!authed.ok) return authed.response;

  const { id } = await context.params;

  try {
    await deleteCompany(id, authed.user.id);
    return NextResponse.json({ deleted: true });
  } catch (err) {
    if (err instanceof CompanyHasLinkedRecordsError) {
      return NextResponse.json(
        { error: { message: err.message } },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: { message: "Company not found." } },
      { status: 404 }
    );
  }
}
