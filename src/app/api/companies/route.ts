import { NextResponse } from "next/server";

import { requireUserOrResponse } from "@/lib/api/auth";
import { jsonError } from "@/lib/api/errors";
import { readJsonOrResponse } from "@/lib/api/json";
import { validateOrResponse } from "@/lib/api/validation";
import { companyCreateSchema } from "@/lib/validation/company";
import { createCompany } from "@/lib/db/companies";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const authed = await requireUserOrResponse();
  if (!authed.ok) return authed.response;

  const body = await readJsonOrResponse(req);
  if (!body.ok) return body.response;

  const parsed = validateOrResponse(companyCreateSchema, body.json, {
    message: "Validation failed.",
    includeFieldErrors: true,
  });
  if (!parsed.ok) return parsed.response;

  try {
    const result = await createCompany(authed.user.id, {
      name: parsed.data.name,
      website: parsed.data.website || undefined,
      location: parsed.data.location,
      industry: parsed.data.industry,
      techStackNotes: parsed.data.techStackNotes,
      applicationProcessNotes: parsed.data.applicationProcessNotes,
      interviewNotes: parsed.data.interviewNotes,
      compensationNotes: parsed.data.compensationNotes,
      generalNotes: parsed.data.generalNotes,
    });

    return NextResponse.json(
      { company: { id: result.id }, created: result.created },
      { status: result.created ? 201 : 200 }
    );
  } catch {
    return jsonError("Failed to create company.", 500);
  }
}
