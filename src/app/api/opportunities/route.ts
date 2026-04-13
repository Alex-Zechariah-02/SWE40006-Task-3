import { NextResponse } from "next/server";

import { requireUserOrResponse } from "@/lib/api/auth";
import { jsonError } from "@/lib/api/errors";
import { readJsonOrResponse } from "@/lib/api/json";
import { validateOrResponse } from "@/lib/api/validation";
import { manualOpportunityCreateSchema } from "@/lib/validation/opportunity";
import { createManualOpportunity } from "@/lib/db/opportunities";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const authed = await requireUserOrResponse();
  if (!authed.ok) return authed.response;

  const body = await readJsonOrResponse(req);
  if (!body.ok) return body.response;

  const parsed = validateOrResponse(manualOpportunityCreateSchema, body.json, {
    message: "Validation failed.",
    includeFieldErrors: true,
  });
  if (!parsed.ok) return parsed.response;

  try {
    const result = await createManualOpportunity(authed.user.id, {
      title: parsed.data.title,
      companyName: parsed.data.companyName,
      opportunityType: parsed.data.opportunityType,
      remoteMode: parsed.data.remoteMode,
      location: parsed.data.location || undefined,
      sourceUrl: parsed.data.sourceUrl || undefined,
      deadline: parsed.data.deadline || undefined,
      snippet: parsed.data.snippet,
      description: parsed.data.description,
      notes: parsed.data.notes,
      tags: parsed.data.tags,
    });

    return NextResponse.json(
      { opportunity: { id: result.id }, created: result.created },
      { status: result.created ? 201 : 200 }
    );
  } catch {
    return jsonError("Failed to create opportunity.", 500);
  }
}
